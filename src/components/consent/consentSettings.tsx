"use client";

import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	ConsentCookie,
	allConsentCookie,
	consentCategories,
	consentCookieModel,
	defaultConsentCookie
} from "./consentCookie";
import { useState } from "react";
import { Switch } from "../ui/switch";
import { useUIStore } from "../../stores/ui";
import omit from "just-omit";

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
	const setShow = useUIStore((state) => state.setSingletonModalShow);

	const consentCookie = consentCookieModel.safeParse(
		readConsentCookie() || {}
	);

	const [cookieState, setCookieState] = useState(
		consentCookie.success
			? {
					...consentCookie.data,
					functionality_storage: "granted" as const,
					security_storage: "granted" as const
			  }
			: allConsentCookie
	);

	const readCategory = (keys: Array<keyof ConsentCookie>) => {
		return () => {
			return keys.reduce((acc, key) => {
				const enumValue = cookieState[key];
				return enumValue === "granted" || acc;
			}, false);
		};
	};

	const updateCategory = (keys: Array<keyof ConsentCookie>) => {
		return (value: boolean) => {
			const enumValue = value ? "granted" : "denied";
			setCookieState((state) => ({
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
			className="p-0 max-w-full max-h-full h-[90vh] w-[90vw] sm:h-[70vh] sm:w-[70vw]"
			hasCloseButton={false}
			onPointerDownOutside={(event) => {
				event.preventDefault();
			}}
			onInteractOutside={(event) => {
				event.preventDefault();
			}}
			onEscapeKeyDown={(event) => {
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
									We process your data to deliver content or
									advertisements and measure the delivery of
									such content or advertisements to extract
									insights about our website. We share this
									information with our partners on the basis
									of consent. You may exercise your right to
									consent, based on a specific purpose below
									or at a partner level in the link under each
									purpose. These choices will be signaled to
									our vendors participating in the
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
									setShow(false);
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
								<AccordionTrigger className="hover:no-underline hover:bg-slate-200 p-2">
									<div className="w-full flex items-center justify-between mr-4">
										<p>{purpose.name}</p>
										{always ? (
											<p>Always Active</p>
										) : (
											<Switch
												onClick={(event) => {
													event.stopPropagation();
												}}
												checked={read()}
												onCheckedChange={(value) => {
													update(value);
												}}
											/>
										)}
									</div>
								</AccordionTrigger>
								<AccordionContent>
									{purpose.description}
								</AccordionContent>
							</AccordionItem>
						);
					})}
				</Accordion>
			</div>
			<DialogFooter className="p-4">
				<div className="w-full flex flex-col-reverse sm:flex-row justify-end items-center gap-2">
					<Button
						className="w-48"
						onClick={() => {
							updateConsentCookie(defaultConsentCookie);
							updateGtmConsent(defaultConsentCookie);
							setShow(false);
						}}
					>
						Necessary Cookies Only
					</Button>
					<Button
						className="w-48"
						onClick={() => {
							updateConsentCookie(cookieState);
							updateGtmConsent(cookieState);
							setShow(false);
						}}
					>
						Confirm My Choices
					</Button>
				</div>
			</DialogFooter>
		</DialogContent>
	);
}
