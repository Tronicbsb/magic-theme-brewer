export type ManaColor = 'white' | 'blue' | 'black' | 'red' | 'green';

export interface DeckTheme {
  id: string;
  name: string;
  description: string;
  manaColor: ManaColor;
  imageUrl?: string;
  createdAt: Date;
}

export interface Player {
  id: number;
  name: string;
  themes: DeckTheme[];
}

export interface DrawResult {
  player1: Player;
  player2: Player;
  drawDate: Date;
}