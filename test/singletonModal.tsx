// 'use client';

// import { useTheme } from 'next-themes';
// import { useEffect, useRef, useState } from 'react';

// import { cn } from '@/lib/style';
// import { useUIStore } from '@/stores/ui';
// import { SupportedTheme } from '@/themes';

// import { Dialog, DialogContent } from './ui/dialog';
// import { Drawer, DrawerContent } from './ui/drawer';

// export const modalClosingAnimationDelay = 400; // ms

// export default function SingletonModal() {
//   const theme = useTheme();
//   const resolvedTheme = theme.resolvedTheme as Omit<SupportedTheme, 'system'>;

//   const { format, modal, setModalConfig, deactivateModal, modalLoading } =
//     useUIStore((state) => ({
//       modalLoading: state.modalLoading,
//       format: state.format,
//       modal: state.modal,
//       setModalConfig: state.setModalConfig,
//       deactivateModal: state.deactivateModal
//     }));

//   const {
//     open,
//     Template,
//     onClose,
//     dismissible,
//     wrapperStyle,
//     wrapperFormatMap,
//     wrapperOverride,
//     types: { dialog, drawer }
//   } = modal;

//   const validDisplayState = Boolean(Template);
//   const resolvedWrapper = wrapperOverride || wrapperFormatMap[format];

//   const isExternalChange = useRef(false);

//   useEffect(() => {
//     console.log('useEffect open: ', open);

//     if (Template) {
//       if (open) {
//         isExternalChange.current = true;
//       } else {
//         console.log('useEffect triggering onClose');
//         onClose(() => {
//           console.log('useEffect onClose pseudo res called');
//           isExternalChange.current = true;
//         });
//       }
//     }
//   }, [open]);

//   function handleClose(modalOpenIntent: boolean) {
//     console.log('handleClose open: ', open);
//     console.log('handleClose modalOpenIntent: ', modalOpenIntent);
//     console.log('modal config: ', modal);

//     if (!isExternalChange.current) {
//       if (Template && open && !modalOpenIntent) {
//         console.log('handleClose triggering deactivateModal');
//         deactivateModal();
//       }
//     } else {
//       console.log('handleClose isExternalChange short-circuiting');
//     }

//     isExternalChange.current = false;
//   }

//   if (resolvedWrapper === 'drawer') {
//     return (
//       <Drawer
//         dismissible={dismissible}
//         modal={drawer.modalMode}
//         open={validDisplayState && open}
//         onOpenChange={handleClose}
//         snapPoints={open ? drawer.snapPoints : [1]}
//         activeSnapPoint={drawer.activeSnapPoint || drawer.snapPoints?.[0] || 1}
//         setActiveSnapPoint={(snapPoint) => {
//           if (snapPoint && Template) {
//             setModalConfig((_defaultState, currentState) => ({
//               ...currentState,
//               types: {
//                 ...currentState.types,
//                 drawer: {
//                   ...currentState.types.drawer,
//                   activeSnapPoint: snapPoint
//                 }
//               }
//             }));
//           }
//         }}
//         shouldScaleBackground={true}
//         fadeFromIndex={drawer.snapPoints.length - 1 || 0.7}
//         closeThreshold={0.5}
//         preventScrollRestoration={false}
//       >
//         <DrawerContent
//           className={cn(
//             resolvedTheme,
//             'bg-gradient-to-b light:from-grad1start light:to-grad1end dark:from-grad2start dark:to-grad2end light:text-primary3 dark:text-secondary6',
//             'w-full h-[96%] flex flex-col',
//             wrapperStyle,
//             'max-w-[100dvw] max-h-[96dvh] overflow-hidden z-[60]'
//           )}
//           style={{
//             colorScheme:
//               resolvedTheme === 'light'
//                 ? 'light'
//                 : resolvedTheme === 'dark'
//                   ? 'dark'
//                   : ''
//           }}
//         >
//           {dismissible && (
//             <div className="flex-shrink-0 mx-auto my-4 h-2 w-[100px] rounded-full light:bg-primary3 dark:bg-primary4" />
//           )}
//           {Template && <Template />}
//         </DrawerContent>
//       </Drawer>
//     );
//   }

//   return (
//     <Dialog
//       open={validDisplayState && open}
//       onOpenChange={(modalOpenIntent) => {
//         // have to manually set isExternalChange to false here, otherwise it is always true
//         isExternalChange.current = false;
//         handleClose(modalOpenIntent);
//       }}
//     >
//       <DialogContent
//         {...(!dismissible
//           ? {
//               hasCloseButton: false,
//               onPointerDownOutside: (event) => {
//                 event.preventDefault();
//               },
//               onInteractOutside: (event) => {
//                 event.preventDefault();
//               },
//               onEscapeKeyDown: (event) => {
//                 event.preventDefault();
//               }
//             }
//           : {})}
//         className={cn(
//           resolvedTheme,
//           'bg-gradient-to-b light:from-grad1start light:to-grad1end dark:from-grad2start dark:to-grad2end light:text-primary3 dark:text-secondary6',
//           wrapperStyle,
//           'w-[50dvw] h-[90dvh] overflow-hidden z-[60]'
//         )}
//         style={{
//           colorScheme:
//             resolvedTheme === 'light'
//               ? 'light'
//               : resolvedTheme === 'dark'
//                 ? 'dark'
//                 : ''
//         }}
//       >
//         {Template && <Template />}
//       </DialogContent>
//     </Dialog>
//   );
// }
