import type { FlickeringCarouselCard } from './src/components/flickeringCards';

// Test that the type is correctly derived from the JSON
const testCard: FlickeringCarouselCard = {
  id: 'test',
  feeling: 'good',
  title: 'Title',
  text: 'Text'
};

console.log(testCard);
