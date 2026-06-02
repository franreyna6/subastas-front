export type RegistrationData = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  dni: string;
  address: string;
  country: string;
  fotoDniFrente: string;
  fotoDniDorso: string;
};

let _data: Partial<RegistrationData> = {};

export const registrationStore = {
  set(partial: Partial<RegistrationData>) {
    _data = { ..._data, ...partial };
  },
  get(): Partial<RegistrationData> {
    return _data;
  },
  clear() {
    _data = {};
  },
};
