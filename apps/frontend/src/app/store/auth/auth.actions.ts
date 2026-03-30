import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IUser, ILoginRequest, ISignupRequest } from '@app/interfaces';

export const AuthActions = createActionGroup({
  source: '[Auth]',
  events: {
    Login: props<ILoginRequest>(),
    LoginSuccess: props<{ user: IUser; accessToken: string; xsrfToken: string }>(),
    LoginFailure: props<{ error: string; code?: string }>(),

    Signup: props<ISignupRequest>(),
    SignupSuccess: props<{ user: IUser; accessToken: string; xsrfToken: string }>(),
    SignupFailure: props<{ error: string }>(),

    Logout: emptyProps(),
    LogoutSuccess: emptyProps(),

    GetMe: emptyProps(),
    GetMeSuccess: props<{ user: IUser }>(),
    GetMeFailure: props<{ error: string }>(),

    RefreshToken: emptyProps(),
    RefreshTokenSuccess: props<{ accessToken: string; xsrfToken: string }>(),
    RefreshTokenFailure: emptyProps(),

    ClearError: emptyProps(),
  },
});
