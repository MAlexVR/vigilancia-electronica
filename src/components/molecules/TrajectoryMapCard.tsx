"use client";

import { Map, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Visible, honest placeholder for "Mapa de trayectoria tecnológica".
 *
 * PENDING: "Mapa de trayectoria tecnológica" — agenda item 4 of the source pptx
 * (Vigilancia_Cientifico-Tecnologica_Electronica_2026.pptx, slide 10) has no
 * content yet. Populate this section once that report/data is delivered.
 */
export function TrajectoryMapCard() {
  return (
    <details className="p-3 group">
      <summary className="flex items-center gap-2 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
        <Map className="w-3.5 h-3.5 text-sena-green" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Mapa de trayectoria tecnológica
        </span>
        <Badge variant="outline" className="text-[9px] ml-auto mr-1">
          Pendiente
        </Badge>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform details-chevron" />
      </summary>
      <div className="mt-2 rounded-lg bg-muted p-3 border border-border/50">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          El informe fuente de vigilancia científico-tecnológica correspondiente
          a esta sección (mapa de trayectoria tecnológica) aún no ha sido
          entregado. Este contenido se publicará tan pronto como el informe
          esté disponible; no se muestran datos, cronogramas ni proyecciones
          estimadas mientras tanto.
        </p>
      </div>
    </details>
  );
}
