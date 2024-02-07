import { usePrefersDark } from '@solid-primitives/media';
import * as storage from '@solid-primitives/storage';
import { createContext, createEffect, ParentComponent, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { getRequestEvent } from 'solid-js/web';

interface Settings {
    dark: boolean;
}

function initialSettings(): Settings {

    const prefersDark = usePrefersDark();

    return {
        dark: prefersDark(),
    };
}

function deserializeSettings(value: string): Settings {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== 'object') return initialSettings();
  
    return {
      dark: 'dark' in parsed && typeof parsed.dark === 'boolean' ? parsed.dark : false,
    };
}

interface AppState {
    get isDark(): boolean;
    setDark(value: boolean): void;
}

const AppContext = createContext<AppState>({} as AppState);

export const useAppState = () => useContext(AppContext);

export const AppContextProvider: ParentComponent = (props) => {

    const event = getRequestEvent();

    createEffect(() => console.log(event))

    const now = new Date();
    const cookieOptions: storage.CookieOptions = {
        expires: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
        getRequest: getRequestEvent
    };

    const [settings, set] = storage.makePersisted(createStore(initialSettings()), {
        storageOptions: cookieOptions,
        storage: storage.cookieStorage,
        deserialize: (value) => deserializeSettings(value),
      });

    createEffect(() => {
        if (settings.dark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    });

    const state: AppState = {
        get isDark() {
          return settings.dark;
        },
        setDark(value) {
          set('dark', value);
        }
    };

    return (
        <AppContext.Provider
            value={state}
            children={props.children}
        />
    )
}