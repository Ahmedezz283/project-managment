import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KcAdminClient from '@keycloak/keycloak-admin-client';

@Injectable()
export class KeycloakAdminService {
  constructor(private configService: ConfigService) {}

  private handleKeycloakError(error: unknown, fallbackMessage: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    const keycloakError = error as {
      response?: {
        status?: number;
        data?: { errorMessage?: string; error?: string };
      };
      message?: string;
    };
    const status = keycloakError?.response?.status;
    const message =
      keycloakError?.response?.data?.errorMessage ||
      keycloakError?.response?.data?.error ||
      fallbackMessage;

    if (status === 401 || status === 403) {
      throw new UnauthorizedException(message);
    }
    if (status === 404) {
      throw new NotFoundException(message);
    }
    if (status === 409) {
      throw new ConflictException(message);
    }
    if (status && status >= 400 && status < 500) {
      throw new BadRequestException(message);
    }

    throw new InternalServerErrorException(fallbackMessage);
  }

  private async getClient(): Promise<KcAdminClient> {
    try {
      const baseUrl = this.configService.get<string>('KEYCLOAK_AUTH_SERVER_URL');
      const username = this.configService.get<string>('KEYCLOAK_ADMIN_USERNAME');
      const password = this.configService.get<string>('KEYCLOAK_ADMIN_PASSWORD');
      const realm = this.configService.get<string>('KEYCLOAK_REALM');

      if (!baseUrl || !username || !password || !realm) {
        throw new InternalServerErrorException('Keycloak configuration is incomplete');
      }

      const kcAdminClient = new KcAdminClient({ baseUrl, realmName: 'master' });

      await kcAdminClient.auth({
        username,
        password,
        grantType: 'password',
        clientId: 'admin-cli',
      });

      kcAdminClient.setConfig({ realmName: realm });
      return kcAdminClient;
    } catch (error) {
      this.handleKeycloakError(error, 'Unable to connect to Keycloak');
    }
  }

  async createUser(username: string, email: string, password: string, firstName: string, lastName: string): Promise<string> {
    try {
      const kcAdminClient = await this.getClient();
      const { id } = await kcAdminClient.users.create({
        username,
        email,
        firstName,
        lastName,
        enabled: true,
        emailVerified: false,
        credentials: [{ type: 'password', value: password, temporary: false }],
      });

      if (!id) {
        throw new InternalServerErrorException('Keycloak did not return the created user ID');
      }

      await kcAdminClient.users.sendVerifyEmail({ id });
      return id;
    } catch (error) {
      this.handleKeycloakError(error, 'Failed to create user in Keycloak');
    }
  }

  async forgetPassword(email: string): Promise<{ message: string }> {
    try {
      const kcAdminClient = await this.getClient();
      const users = await kcAdminClient.users.find({ email, exact: true });

      if (!users.length || !users[0].id) {
        throw new NotFoundException(`User with email '${email}' not found`);
      }

      await kcAdminClient.users.executeActionsEmail({
        id: users[0].id,
        actions: ['UPDATE_PASSWORD'],
      });

      return { message: 'Reset password email sent' };
    } catch (error) {
      this.handleKeycloakError(error, 'Failed to send reset password email');
    }
  }

  //lesa mash sh8ala zy ma ana 3ayaz
  buildUpdatePasswordUrl(clientId: string, redirectUri: string): string {
  const baseUrl = this.configService.get<string>('KEYCLOAK_AUTH_SERVER_URL');
  const realm = this.configService.get<string>('KEYCLOAK_REALM');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid',
    kc_action: 'UPDATE_PASSWORD',
  });

    return `${baseUrl}/realms/${realm}/protocol/openid-connect/auth?${params.toString()}`;
  }

  async createRole(name: string, description?: string): Promise<void> {
    try {
      const kcAdminClient = await this.getClient();
      const existingRole = await kcAdminClient.roles.findOneByName({ name });

      if (existingRole) {
        throw new BadRequestException(`Role '${name}' already exists`);
      }

      await kcAdminClient.roles.create({ name, description: description ?? '' });
    } catch (error) {
      this.handleKeycloakError(error, 'Failed to create role in Keycloak');
    }
  }

  async assignRoleToUser(userId: string, roleName: string): Promise<void> {
    try {
      const kcAdminClient = await this.getClient();
      const role = await kcAdminClient.roles.findOneByName({ name: roleName });

      if (!role?.id || !role.name) {
        throw new NotFoundException(`Role '${roleName}' does not exist`);
      }

      await kcAdminClient.users.addRealmRoleMappings({
        id: userId,
        roles: [{ id: role.id, name: role.name }],
      });
    } catch (error) {
      this.handleKeycloakError(error, 'Failed to assign role to user');
    }
  }

  async getUserById(userId: string) {
    try {
      const kcAdminClient = await this.getClient();
      const user = await kcAdminClient.users.findOne({ id: userId });

      if (!user) {
        throw new NotFoundException(`User with id '${userId}' not found`);
      }

      return user;
    } catch (error) {
      this.handleKeycloakError(error, 'Failed to find user in Keycloak');
    }
  }

  async getUserByEmail(email: string) {
    try {
      const kcAdminClient = await this.getClient();
      const users = await kcAdminClient.users.find({ email, exact: true });

      if (!users.length) {
        throw new NotFoundException(`User with email '${email}' not found`);
      }

      return users[0];
    } catch (error) {
      this.handleKeycloakError(error, 'Failed to find user in Keycloak');
    }
  }

  // async removeRoleFromUser(userId: string, roleName: string): Promise<void> {
  //   const kcAdminClient = await this.getClient();

  //   const role = await kcAdminClient.roles.findOneByName({ name: roleName });

  //   if (!role) {
  //     throw new Error(`Role '${roleName}' does not exist`);
  //   }

  //   await kcAdminClient.users.delRealmRoleMappings({
  //     id: userId,
  //     roles: [{ id: role.id!, name: role.name! }],
  //   });
  // }

  // async isUserInRole(userId: string, roleName: string): Promise<boolean> {
  //   const kcAdminClient = await this.getClient();

  //   const userRoles = await kcAdminClient.users.listRealmRoleMappings({ id: userId });

  //   return userRoles.some((r) => r.name === roleName);
  // }

}