"use client";

import * as React from "react";
import { Trade } from "@/types";
import { TradeDetailModal } from "@/components/trade-detail/modal";
import { TableVirtuoso, Virtuoso } from "react-virtuoso";
import { useTradesUI } from "@/context/trade-context";
import { cn } from "@/lib/utils";
import { TradeRow } from "./trade-row";
import { TableHeader } from "./table-header";
import { MobileTradeCard } from "./mobile-trade-card";

interface UnifiedTradeTableProps {
  groupedTrades: { date: string; label: string; trades: Trade[] }[];
  onSortChange?: (sort: string) => void;
  activeSort?: string;
  isMissedView?: boolean;
}

export function UnifiedTradeTable({
  groupedTrades,
  onSortChange,
  activeSort,
  isMissedView = false,
}: UnifiedTradeTableProps) {
  const { isGhostMode } = useTradesUI();
  const [selectedTrade, setSelectedTrade] = React.useState<Trade | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [hoveredTrade, setHoveredTrade] = React.useState<Trade | null>(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  const handleRowClick = React.useCallback((trade: Trade) => {
    setSelectedTrade(trade);
    setIsModalOpen(true);
  }, []);

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const flattenedRows = React.useMemo(() => {
    const rows: ({ type: 'header'; label: string; count: number; date: string } | { type: 'trade'; trade: Trade; index: number })[] = [];
    groupedTrades.forEach((group) => {
      rows.push({ type: 'header', label: group.label, count: group.trades.length, date: group.date });
      group.trades.forEach((trade, index) => {
        rows.push({ type: 'trade', trade, index });
      });
    });
    return rows;
  }, [groupedTrades]);

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Desktop Table View */}
      <div className="hidden md:block border-b border-border/10 bg-card/5 overflow-hidden flex-1 relative min-h-0">
        <TableVirtuoso
          style={{ height: '100%' }}
          data={flattenedRows}
          fixedHeaderContent={() => (
            <TableHeader onSortChange={onSortChange} activeSort={activeSort} />
          )}
          itemContent={(index, row) => {
            if (row.type === 'header') {
              return (
                <td colSpan={5} className="px-6 py-4 bg-muted/5 border-b border-border/[0.03]">
                  <div className="flex items-center gap-4 opacity-40">
                    <div className="w-8 h-[1px] bg-muted-foreground/20" />
                    <span className="text-xs font-medium text-foreground">{row.label}</span>
                    <div className="h-px flex-1 bg-muted-foreground/10" />
                    <span className="text-xs font-medium text-muted-foreground">{row.count} trades</span>
                  </div>
                </td>
              );
            }

            const { trade } = row;
            return (
              <TradeRow 
                trade={trade} 
                handleRowClick={handleRowClick} 
                isGhostMode={isGhostMode} 
              />
            );
          }}
          components={{
            Table: (props) => <table {...props} className="w-full border-separate border-spacing-0 text-left table-fixed min-w-[900px]" />,
            TableBody: React.forwardRef((props, ref) => <tbody {...props} ref={ref} />),
            TableRow: (props: any) => {
              const item = props.item;
              const isTrade = item?.type === 'trade';
              
              return (
                <tr 
                  {...props} 
                  onMouseEnter={() => isTrade && setHoveredTrade(item.trade)} 
                  onMouseLeave={() => setHoveredTrade(null)} 
                  onMouseMove={handleMouseMove}
                  onClick={() => isTrade && handleRowClick(item.trade)}
                  className={cn(
                    "group transition-colors duration-150",
                    isTrade ? "cursor-pointer hover:bg-muted/15 active:bg-muted/25" : "select-none"
                  )} 
                />
              );
            }
          }}
        />
      </div>

      {/* Mobile view: fill available height so list uses full screen */}
      <div className="md:hidden flex-1 min-h-0 overflow-hidden">
        <Virtuoso
          style={{ height: '100%' }}
          data={flattenedRows}
          itemContent={(index, row) => {
            if (row.type === 'header') {
              return (
                <div className="flex items-center gap-3 px-3 py-3 sticky top-0 z-10 bg-background/80 backdrop-blur-md">
                  <span className="text-xs font-medium text-foreground/40">{row.label}</span>
                  <div className="h-px flex-1 bg-border/20" />
                </div>
              );
            }
            const { trade } = row;
            return <MobileTradeCard trade={trade} handleRowClick={handleRowClick} />;
          }}
        />
      </div>

      {selectedTrade && <TradeDetailModal trade={selectedTrade} open={isModalOpen} onOpenChange={setIsModalOpen} />}
    </div>
  );
}
