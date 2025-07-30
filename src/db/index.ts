import Dexie, { Table } from 'dexie';
import { Machine } from '../types/machine';

export class MachineDatabase extends Dexie {
  machines!: Table<Machine>;

  constructor() {
    super('MachineDatabase');
    this.version(1).stores({
      machines: '++id, name, status, lastUpdate'
    });
  }
}

export const db = new MachineDatabase();