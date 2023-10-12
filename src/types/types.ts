import { Application } from "express";

export type RoutesInput = {
  app: Application,
}

export type TErrorResponse = {
  error: string|null;
  description?: string;
  property?: string;
}


export type TAlert = {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
  structureId: string;
  subjectId: string;
  subjectType: string;
  userId: string;
  projectId: string;
}