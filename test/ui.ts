// import clone from 'just-clone';
// import pick from 'just-pick';
// import { chain } from 'lodash';
// import { re } from 'mathjs';
// import { JSX } from 'react';
// import { STATE } from 'three-stdlib';
// import { DeepWritable } from 'ts-essentials';
// import { create, StateCreator } from 'zustand';

// import { modalClosingAnimationDelay } from '@/components/singletonModal';
// import { SupportedTheme } from '@/themes';

// export type IndependentVisibilities = never;
// export type BlockingVisibilities = 'anchors';

// export type ModalTypes = 'dialog' | 'drawer';

// export type Format = 'mobile' | 'desktop' | 'tablet';

// export const supportedModalWrappers = ['dialog', 'drawer'] as const;
// export type SupportedModalWrapper = (typeof supportedModalWrappers)[number];

// const modalFailsafeTime = 1000;

// const defaultModalState = (() => {
//   return {
//     dismissible: true,
//     onClose: async (res) => {
//       console.log('!!! defaultModalState onClose initiated !!!');
//       res();
//     },
//     wrapperFormatMap: {
//       mobile: 'drawer',
//       tablet: 'dialog',
//       desktop: 'dialog'
//     },
//     wrapperOverride: null,
//     wrapperStyle: '',
//     types: {
//       dialog: {},
//       drawer: {
//         activeSnapPoint: 0,
//         snapPoints: [0],
//         modalMode: true
//       }
//     }
//   } as const;
// }) satisfies () => Omit<UIStoreState['modal'], 'Template' | 'open'>;

// export type ModalConfig = typeof defaultModalState;

// export interface UIStoreState {
//   format: 'mobile' | 'desktop';
//   setFormat: (format: UIStoreState['format']) => void;
//   theme: SupportedTheme;
//   setTheme: (theme: SupportedTheme) => void;
//   visibilities: {
//     [K in IndependentVisibilities]: boolean;
//   } & { [K in BlockingVisibilities]: Array<string> };
//   setVisibilities: (
//     updater: (
//       visibilities: UIStoreState['visibilities']
//     ) => Partial<UIStoreState['visibilities']>
//   ) => void;
//   modalLoading: Promise<void>;
//   modal: {
//     open: boolean;
//     Template: null | ((...props: any[]) => JSX.Element);
//     dismissible: boolean;
//     wrapperStyle: String;
//     wrapperFormatMap: Record<Format, SupportedModalWrapper>;
//     wrapperOverride: null | ModalTypes;
//     onClose: (res: (value: void | PromiseLike<void>) => void) => Promise<void>;
//     types: {
//       dialog: {};
//       drawer: {
//         activeSnapPoint: null | number | string;
//         snapPoints: (number | string)[];
//         modalMode: boolean;
//       };
//     };
//   };
//   setModalConfig: (
//     updater: (
//       defaultState: ReturnType<typeof defaultModalState>,
//       currentState: UIStoreState['modal']
//     ) => Omit<UIStoreState['modal'], 'Template' | 'open'>
//   ) => Promise<void>;
//   activateModal: (
//     provideTemplate: (
//       modalState: UIStoreState['modal']
//     ) => (...props: any[]) => JSX.Element,
//     provideConfig: (
//       defaultState: ReturnType<typeof defaultModalState>,
//       currentState: UIStoreState['modal']
//     ) => Omit<UIStoreState['modal'], 'Template' | 'open'>
//   ) => Promise<void>;
//   deactivateModal: () => Promise<void>;
// }

// export const uiStore: StateCreator<UIStoreState> = (set, get) => {
//   const defaultModal = () => {
//     return {
//       ...defaultModalState(),
//       Template: null,
//       open: false
//     };
//   };

//   const chainLoading = (
//     action: (
//       res: (value: void | PromiseLike<void>) => void,
//       set: (
//         partial:
//           | Partial<UIStoreState>
//           | ((state: UIStoreState) => Partial<UIStoreState>),
//         replace?: boolean | undefined
//       ) => void
//     ) => Promise<void>
//   ) => {
//     return async (
//       res1: (value: void | PromiseLike<void>) => void = () => {}
//     ) => {
//       console.log('chainLoading initiated');
//       let promise: Promise<void>;

//       set((state) => {
//         console.log('chainLoading promise created');
//         // promise constructor callback gets called synchronously but is async, so executes from the task queue
//         const currentLoading = state.modalLoading;

//         promise = new Promise<void>(async (res2, _rej) => {
//           console.log('chainLoading promise awaiting state.modal.loading');
//           console.log('state.modal.loading promise: ', state.modalLoading);

//           await new Promise<void>(async (res3, _rej) => {
//             currentLoading.then(() => res3());

//             setTimeout(() => res3(), modalFailsafeTime);
//           });
//           console.log('state.modal.loading resolved');

//           console.log('chainLoading action initiated');
//           try {
//             action(
//               () => {
//                 console.log('%%% chainLoading action resolved %%%');
//                 res2();
//                 res1();

//                 console.log('promise: ', promise);
//               },
//               (partial, replace) => {
//                 return set((state) => {
//                   if (typeof partial === 'function') {
//                     partial = partial(state);
//                   }

//                   const newLoading = partial.modalLoading
//                     ? partial.modalLoading
//                     : Promise.resolve();

//                   return {
//                     ...partial,
//                     modalLoading: promise.then(() => newLoading)
//                   };
//                 }, replace);
//               }
//             );
//           } catch (err) {
//             console.error('chainLoading action error: ', err);
//             res1();
//             res2();
//           }
//         });

//         console.log(
//           'chainLoading wrapper promise swapped into state.modal.loading'
//         );

//         return {
//           modalLoading: promise
//         };
//       });

//       promise!.catch((err) => {
//         console.error('chainLoading error: ', err);
//       });

//       return promise!;
//     };
//   };

//   return {
//     format: 'mobile',
//     setFormat: (format) => {
//       set({ format });
//     },
//     theme: 'light',
//     setTheme: (theme) => {
//       set({ theme });
//     },
//     visibilities: {
//       hero: true,
//       anchors: []
//     },
//     setVisibilities: (updater) => {
//       set((state) => ({
//         visibilities: {
//           ...state.visibilities,
//           ...updater(state.visibilities)
//         }
//       }));
//     },
//     modalLoading: Promise.resolve(),
//     modal: defaultModal(),
//     setModalConfig: async (updater) => {
//       console.log('!!! setModalConfig initiated !!!');
//       console.log('updater: ', updater);

//       return chainLoading(async (res1, set1) => {
//         set1((state) => {
//           const config = updater(defaultModalState(), state.modal);

//           return {
//             modal: {
//               ...config,
//               // can the onClose functions getting double, triple, etc. wrapped be a problem?
//               onClose: chainLoading(async (res2, set2) => {
//                 console.log('!!! setModalConfig onClose initiated !!!');
//                 set2((_state) => {
//                   return {
//                     modal: {
//                       ...defaultModal()
//                     }
//                   };
//                 });

//                 await config.onClose(res2);
//                 console.log('!!! setModalConfig onClose promise resolved !!!');
//               }),
//               ...pick(state.modal, ['Template', 'open'])
//             }
//           };
//         });
//         res1();
//         console.log('!!! setModalConfig promise resolved !!!');
//       })(() => {
//         console.log('!!! setModalConfig pseudo res called !!!');
//       });
//     },
//     /**
//      * Updater should return a NAMED function that returns a JSX element
//      */
//     activateModal: async (provideNamedTemplate, provideConfig) => {
//       console.log('!!! activate modal initiated !!!');

//       return chainLoading(async (res1, set1) => {
//         set1((state) => {
//           const Template = provideNamedTemplate(state.modal);
//           const config = provideConfig(defaultModalState(), state.modal);

//           return {
//             modal: {
//               ...config,
//               onClose: chainLoading(async (res2, set2) => {
//                 console.log('!!! activateModal onClose initiated !!!');
//                 set2((state) => {
//                   return {
//                     modal: {
//                       ...defaultModal()
//                     }
//                   };
//                 });

//                 await config.onClose(res2);
//                 console.log('!!! activateModal onClose promise resolved !!!');
//               }),
//               Template,
//               open: true
//             }
//           };
//         });
//         res1();
//         console.log('!!! activate modal promise resolved !!!');
//       })(() => {
//         console.log('!!! activate modal pseudo res called !!!');
//       });
//     },
//     /**
//      *  Requires a useEffect in the global modal component to handle onClose, otherwise won't work properly
//      */
//     deactivateModal: async function () {
//       console.log('!!! deactivate modal initiated !!!');

//       return chainLoading(async (res, set) => {
//         set((state) => {
//           return {
//             modal: {
//               ...state.modal,
//               open: false
//             }
//           };
//         });

//         setTimeout(() => {
//           res();
//           console.log('!!! deactivate modal promise resolved !!!');
//         }, modalClosingAnimationDelay);
//       })(() => {
//         console.log('!!! deactivate modal pseudo res called !!!');
//       });
//     }
//   };
// };

// export const useUIStore = create(uiStore);
