import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'webhook-service',
  brokers: [process.env.KAFKA_BROKER!],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_USERNAME!,
    password: process.env.KAFKA_PASSWORD!,
  },
});

const producer = kafka.producer();

export async function sendToKafka(topic: string, message: any) {
  await producer.connect();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }]
  });
  await producer.disconnect();
}
