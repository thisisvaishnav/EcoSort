import { QuizQuestion } from '../types/game';
import { GAME_ITEMS } from './items';

const getItem = (id: string) => GAME_ITEMS.find((i) => i.id === id)!;

export const LEVEL_QUIZZES: Record<number, QuizQuestion[]> = {
  1: [
    {
      id: 'q1_1',
      question: 'Where should this apple core go?',
      item: getItem('apple_core'),
      options: [
        { label: 'Green Wet Bin', bin: 'wet' },
        { label: 'Blue Dry Bin', bin: 'dry' },
      ],
      correctBin: 'wet',
      fact: 'Apple cores rot and turn into rich soil nutrients!',
    },
    {
      id: 'q1_2',
      question: 'Where do you throw this clean cardboard box?',
      item: getItem('cereal_box'),
      options: [
        { label: 'Green Wet Bin', bin: 'wet' },
        { label: 'Blue Dry Bin', bin: 'dry' },
      ],
      correctBin: 'dry',
      fact: 'Dry cardboard can be pulped into new paper products.',
    },
    {
      id: 'q1_3',
      question: 'Where does an aluminum soda can go?',
      item: getItem('soda_can'),
      options: [
        { label: 'Green Wet Bin', bin: 'wet' },
        { label: 'Blue Dry Bin', bin: 'dry' },
      ],
      correctBin: 'dry',
      fact: 'Aluminum cans can be recycled forever without losing strength.',
    },
  ],
  2: [
    {
      id: 'q2_1',
      question: 'An old battery has dangerous acid. Which bin protects us?',
      item: getItem('battery_aa'),
      options: [
        { label: 'Green Bin', bin: 'wet' },
        { label: 'Blue Bin', bin: 'dry' },
        { label: 'Red Hazardous Bin', bin: 'hazardous' },
      ],
      correctBin: 'hazardous',
      fact: 'Red bin keeps battery chemicals safe from ground soil.',
    },
    {
      id: 'q2_2',
      question: 'Old medicine should never go in kitchen trash. Which bin?',
      item: getItem('expired_medicine'),
      options: [
        { label: 'Red Hazardous Bin', bin: 'hazardous' },
        { label: 'Blue Dry Bin', bin: 'dry' },
      ],
      correctBin: 'hazardous',
      fact: 'Medicines require high-temperature safe incineration.',
    },
    {
      id: 'q2_3',
      question: 'Where do old newspaper pages belong?',
      item: getItem('newspaper'),
      options: [
        { label: 'Red Hazardous Bin', bin: 'hazardous' },
        { label: 'Blue Dry Bin', bin: 'dry' },
      ],
      correctBin: 'dry',
      fact: 'Clean paper belongs with recyclables.',
    },
  ],
  3: [
    {
      id: 'q3_1',
      question: 'In school sorting, where does white notebook paper go?',
      item: getItem('notebook_paper'),
      options: [
        { label: 'Blue Paper Bin', bin: 'paper' },
        { label: 'Yellow Plastic Bin', bin: 'plastic' },
        { label: 'Green Wet Bin', bin: 'wet' },
      ],
      correctBin: 'paper',
      fact: 'Clean paper stays separated from plastic containers.',
    },
    {
      id: 'q3_2',
      question: 'Where does an empty juice bottle go?',
      item: getItem('juice_bottle'),
      options: [
        { label: 'Blue Paper Bin', bin: 'paper' },
        { label: 'Yellow Plastic Bin', bin: 'plastic' },
      ],
      correctBin: 'plastic',
      fact: 'Plastic bottles get washed and remolded.',
    },
    {
      id: 'q3_3',
      question: 'What happens if we recycle plastic jugs?',
      item: getItem('milk_jug'),
      options: [
        { label: 'Yellow Plastic Bin', bin: 'plastic' },
        { label: 'Blue Paper Bin', bin: 'paper' },
      ],
      correctBin: 'plastic',
      fact: 'Sturdy plastic jugs make outdoor furniture and pipes!',
    },
  ],
};
