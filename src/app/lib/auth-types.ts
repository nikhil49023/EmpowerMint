
export type AuthenticateUserInput = {
    email: string;
    password?: string;
    displayName?: string;
    role?: 'individual' | 'msme';
    action: 'login' | 'signup';
};

export type AuthenticateUserOutput = {
    uid: string;
    email: string;
    displayName: string;
    role: 'individual' | 'msme';
    createdAt: string;
    msmeName?: string;
    msmeService?: string;
    msmeLocation?: string;
    ownerContact?: string;
};
