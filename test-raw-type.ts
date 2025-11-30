import type { RawMessageType } from './src/i18n';

// Test: should resolve to the carousel cards array type
type CardsType = RawMessageType<'TEST.hero.carousel.cards'>;

// Test: should resolve to string
type TitleType = RawMessageType<'TEST.hero.title'>;

// Verify the cards type has the expected shape
const testCards: CardsType = [
  { id: 'test', feeling: 'good', title: 'Title', text: 'Text' }
];

// Verify title is string
const testTitle: TitleType = 'Hello';

console.log(testCards, testTitle);
