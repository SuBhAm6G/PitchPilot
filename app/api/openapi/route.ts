import { NextResponse } from "next/server";

export async function GET() {
  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "PitchPilot API",
      version: "1.0.0",
      description: "API for Stadium Operations and GenAI Fan Experience",
    },
    paths: {
      "/api/chat": {
        post: {
          summary: "Generate AI Assistant Response",
          description:
            "Takes user context and stadium state, returns context-aware recommendations and LLM reply.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    userProfile: { type: "object" },
                    stadiumState: { type: "object" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Successful response",
            },
          },
        },
      },
      "/api/stadium": {
        get: {
          summary: "Get Real-time Stadium State",
          description:
            "Returns mocked IoT sensor data for crowd density, incidents, and wait times.",
          responses: {
            "200": {
              description: "Successful response",
            },
          },
        },
      },
      "/api/health": {
        get: {
          summary: "System Health Check",
          responses: {
            "200": {
              description: "System metrics and status",
            },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}
