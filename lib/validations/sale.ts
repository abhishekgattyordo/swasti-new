import { z } from 'zod';

// Helper to convert empty string to undefined, then to number
const toNumber = (val: any) => {
  if (val === '' || val === null || val === undefined) return undefined;
  const num = Number(val);
  return isNaN(num) ? undefined : num;
};

export const SaleItemSchema = z.object({
  medicineId: z.preprocess(
    (val) => toNumber(val),
    z.number().int().positive()
  ),
  quantity: z.preprocess(
    (val) => toNumber(val),
    z.number().int().positive()
  ),
  unitPrice: z.preprocess(
    (val) => toNumber(val),
    z.number().positive()
  ),
  taxPercent: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return 0;
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    },
    z.number().min(0).default(0)
  ),
});

export const SaleSchema = z.object({
  patientId: z.string().optional(),
  patientName: z.string().optional(),
  walkinName: z.string().optional(),
  walkinPhone: z.string().optional(),
  walkinAddress: z.string().optional(),
  doctorName: z.string().min(1, 'Doctor name is required'),
  saleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  subtotal: z.preprocess(
    (val) => toNumber(val),
    z.number().positive()
  ),
  taxTotal: z.preprocess(
    (val) => toNumber(val),
    z.number().min(0)
  ),
  discountTotal: z.preprocess(
    (val) => toNumber(val),
    z.number().min(0).default(0)
  ),
  grandTotal: z.preprocess(
    (val) => toNumber(val),
    z.number().positive()
  ),
  paymentMode: z.string(),
  items: z.array(SaleItemSchema).min(1, 'At least one item is required'),
});

export type SaleInput = z.infer<typeof SaleSchema>;

