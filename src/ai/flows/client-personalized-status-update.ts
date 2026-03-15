'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating personalized real-time status updates for clients.
 *
 * - clientPersonalizedStatusUpdate - A function that generates a personalized status update for a client.
 * - ClientPersonalizedStatusUpdateInput - The input type for the clientPersonalizedStatusUpdate function.
 * - ClientPersonalizedStatusUpdateOutput - The return type for the clientPersonalizedStatusUpdate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClientPersonalizedStatusUpdateInputSchema = z.object({
  requestId: z.string().describe('The unique identifier for the service request.'),
  clientName: z.string().describe('The name of the client receiving the update.'),
  driverName: z.string().describe('The name of the driver assigned to the service request.'),
  driverLocation: z
    .string()
    .describe('A brief description of the driver\'s current location.'),
  serviceStatus: z
    .string()
    .describe('The current status of the service (e.g., "en route", "arrived", "completed", "delayed").'),
  estimatedArrivalTime: z
    .string()
    .describe('The estimated time of arrival for the service, formatted as a string.'),
  serviceType: z.string().describe('The type of service being provided (e.g., "ride", "delivery").'),
  destination: z.string().describe('The client\'s destination for the service.'),
});
export type ClientPersonalizedStatusUpdateInput = z.infer<typeof ClientPersonalizedStatusUpdateInputSchema>;

const ClientPersonalizedStatusUpdateOutputSchema = z.object({
  personalizedMessage:
    z.string().describe('A clear, concise, and personalized real-time status update for the client.'),
  statusCategory: z
    .string()
    .describe(
      "A brief, categorized status (e.g., 'On the Way', 'Arrived', 'Delayed', 'Completed', 'Cancelled', 'Awaiting Driver')."
    ),
  estimatedTimeRemaining: z
    .string()
    .describe(
      "A human-readable estimated time remaining (e.g., '5-10 minutes', 'arriving soon', 'now', 'N/A')."
    ),
});
export type ClientPersonalizedStatusUpdateOutput = z.infer<typeof ClientPersonalizedStatusUpdateOutputSchema>;

export async function clientPersonalizedStatusUpdate(
  input: ClientPersonalizedStatusUpdateInput
): Promise<ClientPersonalizedStatusUpdateOutput> {
  return clientPersonalizedStatusUpdateFlow(input);
}

const clientPersonalizedStatusUpdatePrompt = ai.definePrompt({
  name: 'clientPersonalizedStatusUpdatePrompt',
  input: {schema: ClientPersonalizedStatusUpdateInputSchema},
  output: {schema: ClientPersonalizedStatusUpdateOutputSchema},
  prompt: `You are AngelWatch's intelligent assistant, tasked with providing clear, concise, and personalized real-time updates to our clients. Based on the following service request details, generate a friendly and informative status update.

Here is the information about the service request:
- Client Name: {{{clientName}}}
- Request ID: {{{requestId}}}
- Service Type: {{{serviceType}}}
- Destination: {{{destination}}}
- Assigned Driver: {{{driverName}}}
- Driver's Current Location: {{{driverLocation}}}
- Service Status: {{{serviceStatus}}}
- Estimated Arrival Time: {{{estimatedArrivalTime}}}

Generate a personalized message (personalizedMessage), a brief status category (statusCategory), and a human-readable estimated time remaining (estimatedTimeRemaining).

For personalizedMessage, address the client by name. Be polite and informative.
For statusCategory, categorize the service status into one of these: "On the Way", "Arrived", "Delayed", "Completed", "Cancelled", "Awaiting Driver".
For estimatedTimeRemaining, provide a concise time estimate like "5 minutes", "arriving shortly", "in 10-15 minutes", or "now". If the service is completed or cancelled, state "N/A".`,
});

const clientPersonalizedStatusUpdateFlow = ai.defineFlow(
  {
    name: 'clientPersonalizedStatusUpdateFlow',
    inputSchema: ClientPersonalizedStatusUpdateInputSchema,
    outputSchema: ClientPersonalizedStatusUpdateOutputSchema,
  },
  async input => {
    const {output} = await clientPersonalizedStatusUpdatePrompt(input);
    return output!;
  }
);
