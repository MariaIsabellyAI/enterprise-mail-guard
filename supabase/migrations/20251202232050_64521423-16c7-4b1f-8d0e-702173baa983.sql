-- Create enum for user types
CREATE TYPE public.user_type AS ENUM ('admin', 'colaborador');

-- Create profiles table for users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  tipo_usuario user_type DEFAULT 'colaborador',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emails table
CREATE TABLE public.emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remetente TEXT NOT NULL,
  destinatario TEXT NOT NULL,
  assunto TEXT NOT NULL,
  corpo TEXT,
  data_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estado TEXT,
  municipio TEXT,
  classificado BOOLEAN DEFAULT FALSE,
  colaborador_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create brazilian states table for reference
CREATE TABLE public.estados (
  id SERIAL PRIMARY KEY,
  sigla TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL
);

-- Create municipalities table
CREATE TABLE public.municipios (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  estado_sigla TEXT NOT NULL REFERENCES public.estados(sigla) ON DELETE CASCADE
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipios ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND tipo_usuario = 'admin'
    )
  );

-- Emails policies - authenticated users can view all emails
CREATE POLICY "Authenticated users can view all emails"
  ON public.emails FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert emails"
  ON public.emails FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update emails"
  ON public.emails FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete emails"
  ON public.emails FOR DELETE
  TO authenticated
  USING (true);

-- Estados and municipios are public read
CREATE POLICY "Anyone can read estados"
  ON public.estados FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read municipios"
  ON public.municipios FOR SELECT
  USING (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emails_updated_at
  BEFORE UPDATE ON public.emails
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, tipo_usuario)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    'colaborador'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert Brazilian states
INSERT INTO public.estados (sigla, nome) VALUES
  ('AC', 'Acre'), ('AL', 'Alagoas'), ('AP', 'Amapá'), ('AM', 'Amazonas'),
  ('BA', 'Bahia'), ('CE', 'Ceará'), ('DF', 'Distrito Federal'), ('ES', 'Espírito Santo'),
  ('GO', 'Goiás'), ('MA', 'Maranhão'), ('MT', 'Mato Grosso'), ('MS', 'Mato Grosso do Sul'),
  ('MG', 'Minas Gerais'), ('PA', 'Pará'), ('PB', 'Paraíba'), ('PR', 'Paraná'),
  ('PE', 'Pernambuco'), ('PI', 'Piauí'), ('RJ', 'Rio de Janeiro'), ('RN', 'Rio Grande do Norte'),
  ('RS', 'Rio Grande do Sul'), ('RO', 'Rondônia'), ('RR', 'Roraima'), ('SC', 'Santa Catarina'),
  ('SP', 'São Paulo'), ('SE', 'Sergipe'), ('TO', 'Tocantins');

-- Insert some major cities for each state
INSERT INTO public.municipios (nome, estado_sigla) VALUES
  ('Rio Branco', 'AC'), ('Maceió', 'AL'), ('Macapá', 'AP'), ('Manaus', 'AM'),
  ('Salvador', 'BA'), ('Fortaleza', 'CE'), ('Brasília', 'DF'), ('Vitória', 'ES'),
  ('Goiânia', 'GO'), ('São Luís', 'MA'), ('Cuiabá', 'MT'), ('Campo Grande', 'MS'),
  ('Belo Horizonte', 'MG'), ('Belém', 'PA'), ('João Pessoa', 'PB'), ('Curitiba', 'PR'),
  ('Recife', 'PE'), ('Teresina', 'PI'), ('Piripiri', 'PI'), ('Rio de Janeiro', 'RJ'),
  ('Natal', 'RN'), ('Porto Alegre', 'RS'), ('Porto Velho', 'RO'), ('Boa Vista', 'RR'),
  ('Florianópolis', 'SC'), ('São Paulo', 'SP'), ('Aracaju', 'SE'), ('Palmas', 'TO'),
  ('Juazeiro do Norte', 'CE'), ('Sobral', 'CE'), ('Parnaíba', 'PI'), ('Picos', 'PI'),
  ('Imperatriz', 'MA'), ('Caxias', 'MA'), ('Campinas', 'SP'), ('Guarulhos', 'SP'),
  ('Niterói', 'RJ'), ('Petrópolis', 'RJ'), ('Uberlândia', 'MG'), ('Contagem', 'MG');