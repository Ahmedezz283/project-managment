import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FlowableService {
  constructor(private readonly http: HttpService) {}

  async startProcess(processDefinitionKey: string, variables: Record<string, any>) {
    const payload = {
      processDefinitionKey,
      variables: Object.entries(variables).map(([name, value]) => ({
        name,
        value,
        type: typeof value === 'number' ? 'integer' : 'string',
      })),
    };
    const { data } = await firstValueFrom(
      this.http.post('/runtime/process-instances', payload),
    );
    return data;
  }

  async getActiveTask(processInstanceId: string) {
    const { data } = await firstValueFrom(
      this.http.get('/runtime/tasks', { params: { processInstanceId } }),
    );
    return data.data[0]; 
  }

  async completeTask(taskId: string, variables: Record<string, any>) {
    const payload = {
      action: 'complete',
      variables: Object.entries(variables).map(([name, value]) => ({
        name,
        value,
        type: typeof value === 'number' ? 'integer' : 'string',
      })),
    };
    await firstValueFrom(
      this.http.post(`/runtime/tasks/${taskId}/action`, payload),
    );
  }
}