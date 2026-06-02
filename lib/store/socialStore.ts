export type SocialProvider = 'google' | 'facebook' | 'apple';

export type SocialData = {
  provider: SocialProvider;
  email: string;
  nombre: string;
};

let _data: SocialData | null = null;

export const socialStore = {
  set(data: SocialData) { _data = data; },
  get(): SocialData | null { return _data; },
  clear() { _data = null; },
};
