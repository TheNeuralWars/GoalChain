import { getQueueStatus } from '../utils/queueUtils';
const queueStatusHandler = {
    name: 'queueStatus',
    description: 'Check the status of the task queue',
    voiceTriggers: ['how is the status of the queue of the tasks?'],
    execute: async (context) => {
        const status = await getQueueStatus();
        return `The current status of the task queue is: ${status}`;
    },
};
export default queueStatusHandler;
