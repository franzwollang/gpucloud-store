'use client';

import omit from 'just-omit';
import { useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

import { useUIStore } from '../../stores/ui';
import { Switch } from '../ui/switch';
import {
  allConsentCookie,
  consentCategories,
  type ConsentCookie,
  consentCookieModel,
  defaultConsentCookie
} from './consentCookie';

type ConsentSettingsProps = {
  readConsentCookie: () => string | undefined;
  updateConsentCookie: (consentCookie: ConsentCookie) => void;
  updateGtmConsent: (consentCookie: ConsentCookie) => void;
};

export default function ConsentSettings({
  readConsentCookie,
  updateConsentCookie,
  updateGtmConsent
}: ConsentSettingsProps) {
  const consentCookie = consentCookieModel.safeParse(readConsentCookie() ?? {});

  const [cookieState, setCookieState] = useState(
    consentCookie.success
      ? {
          ...consentCookie.data,
          functionality_storage: 'granted' as const,
          security_storage: 'granted' as const
        }
      : allConsentCookie
  );

  const readCategory = (keys: Array<keyof ConsentCookie>) => {
    return () => {
      return keys.reduce((acc, key) => {
        const enumValue = cookieState[key];
        return enumValue === 'granted' || acc;
      }, false);
    };
  };

  const updateCategory = (keys: Array<keyof ConsentCookie>) => {
    return (value: boolean) => {
      const enumValue = value ? 'granted' : 'denied';
      setCookieState(state => ({
        ...state,
        ...keys.reduce((acc, key) => {
          acc[key] = enumValue;
          return acc;
        }, {} as Partial<ConsentCookie>)
      }));
    };
  };

  return (
    <DialogContent
      className="h-[90vh] max-h-full w-[90vw] max-w-full p-0 sm:h-[70vh] sm:w-[70vw]"
      showCloseButton={false}
      onPointerDownOutside={event => {
        event.preventDefault();
      }}
      onInteractOutside={event => {
        event.preventDefault();
      }}
      onEscapeKeyDown={event => {
        event.preventDefault();
      }}
    >
      <div className="overflow-y-scroll p-8">
        <DialogHeader className="mb-12">
          <DialogTitle>About Your Privacy</DialogTitle>
          <DialogDescription>
            <div className="flex flex-col justify-start gap-6">
              <div>
                <p>
                  We process your data to deliver content or advertisements and
                  measure the delivery of such content or advertisements to
                  extract insights about our website. We share this information
                  with our partners on the basis of consent. You may exercise
                  your right to consent, based on a specific purpose below or at
                  a partner level in the link under each purpose. These choices
                  will be signaled to our vendors participating in the
                  Transparency and Consent Framework.
                </p>
                <a
                  className="text-blue-500 underline"
                  href=""
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
              </div>
              <Button
                className="w-48"
                onClick={() => {
                  updateConsentCookie(allConsentCookie);
                  updateGtmConsent(allConsentCookie);
                  // setShow(false);
                }}
              >
                Accept All Cookies
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogTitle>Manage Consent Preferences</DialogTitle>
        <Accordion type="single" collapsible className="w-full p-6">
          {consentCategories.map((purpose, index) => {
            const read = readCategory(purpose.keys);
            const update = updateCategory(purpose.keys);
            const always = purpose.keys.length < 1;

            return (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="p-2 hover:bg-slate-200 hover:no-underline">
                  <div className="mr-4 flex w-full items-center justify-between">
                    <p>{purpose.name}</p>
                    {always ? (
                      <p>Always Active</p>
                    ) : (
                      <Switch
                        // onClick={event => {
                        //   event.stopPropagation();
                        // }}
                        checked={read()}
                        // onCheckedChange={value => {
                        //   update(value);
                        // }}
                      />
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>{purpose.description}</AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
      <DialogFooter className="p-4">
        <div className="flex w-full flex-col-reverse items-center justify-end gap-2 sm:flex-row">
          <Button
            className="w-48"
            onClick={() => {
              updateConsentCookie(defaultConsentCookie);
              updateGtmConsent(defaultConsentCookie);
              // setShow(false);
            }}
          >
            Necessary Cookies Only
          </Button>
          <Button
            className="w-48"
            onClick={() => {
              updateConsentCookie(cookieState);
              updateGtmConsent(cookieState);
              // setShow(false);
            }}
          >
            Confirm My Choices
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
