import { HydratedDocument, InferSchemaType, Schema, model } from 'mongoose';

import { APPLICATION_STATUSES } from '../types/application.types';

const jobApplicationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    jdLink: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: 4000,
    },
    dateApplied: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'applied',
      index: true,
    },
    salaryRange: {
      type: String,
      trim: true,
      maxlength: 120,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

jobApplicationSchema.index({ userId: 1, dateApplied: -1, createdAt: -1 });

type JobApplication = InferSchemaType<typeof jobApplicationSchema>;

export type JobApplicationDocument = HydratedDocument<JobApplication>;

export const JobApplicationModel = model<JobApplication>('JobApplication', jobApplicationSchema);
