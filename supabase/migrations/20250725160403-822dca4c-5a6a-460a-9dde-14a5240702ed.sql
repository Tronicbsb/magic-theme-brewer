-- Create a table for deck themes
CREATE TABLE public.deck_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  mana_color TEXT NOT NULL CHECK (mana_color IN ('white', 'blue', 'black', 'red', 'green')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.deck_themes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read themes (public data)
CREATE POLICY "Anyone can view deck themes" 
ON public.deck_themes 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert themes (for now)
CREATE POLICY "Anyone can create deck themes" 
ON public.deck_themes 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to update themes (for now)
CREATE POLICY "Anyone can update deck themes" 
ON public.deck_themes 
FOR UPDATE 
USING (true);

-- Create policy to allow anyone to delete themes (for now)
CREATE POLICY "Anyone can delete deck themes" 
ON public.deck_themes 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_deck_themes_updated_at
  BEFORE UPDATE ON public.deck_themes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default themes
INSERT INTO public.deck_themes (name, description, mana_color) VALUES
  ('Cats', 'Focado em criaturas felinas e suas sinergias', 'white'),
  ('Healing', 'Focado em ganhar pontos de vida', 'white'),
  ('Wizards', 'Com ênfase em criaturas Mago e feitiços', 'blue'),
  ('Pirates', 'Centrado em criaturas piratas e suas travessuras', 'blue'),
  ('Vampires', 'Focado em criaturas vampiras e drenar a vida do oponente', 'black'),
  ('Undead', 'Com foco em zumbis e outras criaturas mortas-vivas', 'black'),
  ('Goblins', 'Decks rápidos e agressivos com muitas criaturas Goblins', 'red'),
  ('Inferno', 'Focado em feitiços de dano direto (queimar)', 'red'),
  ('Elves', 'Gira em torno de criaturas Elfo e acelerar mana', 'green'),
  ('Primal', 'Focado em criaturas grandes e poderosas da natureza', 'green');