import { useQuery } from '@tanstack/react-query';
import { locationService } from '@/services/locationService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LocationSelectProps {
  estado: string;
  municipio: string;
  onEstadoChange: (value: string) => void;
  onMunicipioChange: (value: string) => void;
  compact?: boolean;
}

export function LocationSelect({ 
  estado, 
  municipio, 
  onEstadoChange, 
  onMunicipioChange,
  compact = false 
}: LocationSelectProps) {
  const { data: estados = [] } = useQuery({
    queryKey: ['estados'],
    queryFn: locationService.getEstados,
  });

  const { data: municipios = [] } = useQuery({
    queryKey: ['municipios', estado],
    queryFn: () => locationService.getMunicipios(estado),
    enabled: !!estado,
  });

  return (
    <div className={compact ? "flex gap-2" : "grid gap-4 sm:grid-cols-2"}>
      <Select value={estado} onValueChange={onEstadoChange}>
        <SelectTrigger className={compact ? "w-20" : ""}>
          <SelectValue placeholder="UF" />
        </SelectTrigger>
        <SelectContent>
          {estados.map((e) => (
            <SelectItem key={e.sigla} value={e.sigla}>
              {e.sigla}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={municipio} 
        onValueChange={onMunicipioChange}
        disabled={!estado}
      >
        <SelectTrigger className={compact ? "w-32" : ""}>
          <SelectValue placeholder="Município" />
        </SelectTrigger>
        <SelectContent>
          {municipios.map((m) => (
            <SelectItem key={m.id} value={m.nome}>
              {m.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
