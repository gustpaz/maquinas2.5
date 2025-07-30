export interface Machine {
  id: string;
  name: string;
  status: 'active' | 'maintenance' | 'inactive';
  lastUpdate: Date;
  costs: Transaction[];
  revenues: Transaction[];
  fixedCosts: FixedCost[];
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: Date;
}

export interface FixedCost {
  id: string;
  name: string;
  amount: number;
  description?: string;
  machineId: string;
}