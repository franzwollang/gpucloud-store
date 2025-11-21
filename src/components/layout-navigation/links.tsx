// type half-way works, but allows for some invalid combinations
import type { ReactNode } from 'react';

import type { MessageLeafPaths } from '@/i18n';
import { cn } from '@/lib/style';
import type { PathsEndingWith } from '@/lib/typing';
import { Link } from '@/navigation';

export type NavLinkConfig = Readonly<{
  textKey: PathsEndingWith<MessageLeafPaths, '.linkText'>;
  intlAnchorKey?: PathsEndingWith<MessageLeafPaths, '.anchor'>;
  href: string;
}>;

export type NavLink = Readonly<
  | {
      type: 'simple';
      href: string;
      text: string;
    }
  | {
      type: 'withAnchor';
      href: string;
      text: string;
      intlAnchor: string;
      intlAnchorKey: NonNullable<NavLinkConfig['intlAnchorKey']>;
    }
>;

type CustomLinkProps = {
  link: NavLink;
  className?: string;
  onClick?: () => void;
};

export function CustomLink({ link, className, onClick }: CustomLinkProps) {
  return (
    <Link
      tabIndex={0}
      onClick={onClick}
      href={
        link.href + `${link.type === 'withAnchor' ? '#' + link.intlAnchor : ''}`
      }
      className={cn(className, '')}
    >
      {link.text}
    </Link>
  );
}

export function PageAnchor({
  id,
  children,
  ariaLabel
}: {
  id: string;
  children: ReactNode;
  ariaLabel: string;
}) {
  return (
    <div
      aria-label={ariaLabel}
      tabIndex={0}
      id={id}
      className="scroll-m-[33vh] scroll-smooth"
    >
      {children}
    </div>
  );
}

export const linksConfig = {
  location: [
    {
      textKey: 'UI.navLinks.home.linkText',
      intlAnchorKey: 'UI.navLinks.home.anchor',
      href: '/'
    },
    {
      textKey: 'UI.navLinks.about.linkText',
      intlAnchorKey: 'UI.navLinks.about.anchor',
      href: '/'
    },
    {
      textKey: 'UI.navLinks.contact.linkText',
      intlAnchorKey: 'UI.navLinks.contact.anchor',
      href: '/'
    }
  ]
} as const satisfies Record<string, NavLinkConfig[]>;
