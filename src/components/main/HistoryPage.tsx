"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  History,
  Trophy,
  TrendingDown,
  TrendingUp,
  Calendar,
  Filter,
  Search,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { useGameHistory } from "@/hooks/useGameData";
import { cn } from "@/lib/utils";
import { User } from "@/lib/auth";
import { Result } from "@/types";

// Types
interface HistoryPageProps {
  user: User;
  gameHistory?: Result[];
}

type FilterResult = "all" | "gagné" | "perdu";
type SortBy = "date-desc" | "date-asc" | "number-desc" | "number-asc";

interface GameStats {
  totalGames: number;
  wonGames: number;
  winRate: number;
  totalPointsWon: number;
  totalPointsLost: number;
}

interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: typeof History;
  colorClass: string;
  bgClass: string;
}

// Constants
const FILTER_OPTIONS = {
  ALL: "all" as const,
  WON: "gagné" as const,
  LOST: "perdu" as const,
} as const;

const SORT_OPTIONS = {
  DATE_DESC: "date-desc" as const,
  DATE_ASC: "date-asc" as const,
  NUMBER_DESC: "number-desc" as const,
  NUMBER_ASC: "number-asc" as const,
} as const;

const DATE_LOCALE = "fr-FR";
const CSV_HEADERS = [
  "Date",
  "Nombre généré",
  "Résultat",
  "Changement de solde",
  "Nouveau solde",
] as const;

export default function HistoryPage({
  user,
  gameHistory: initialHistory,
}: HistoryPageProps) {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterResult, setFilterResult] = useState<FilterResult>(
    FILTER_OPTIONS.ALL
  );
  const [sortBy, setSortBy] = useState<SortBy>(SORT_OPTIONS.DATE_DESC);

  // Data fetching
  const { gameHistory } = useGameHistory(user?.id || "");
  const currentHistory: Result[] = useMemo(
    () => (gameHistory?.length > 0 ? gameHistory : initialHistory || []),
    [gameHistory, initialHistory]
  );

  // Utility functions
  const filterBySearch = useCallback(
    (games: Result[], term: string): Result[] => {
      if (!term) return games;
      return games.filter((game) =>
        game.generatedNumber.toString().includes(term)
      );
    },
    []
  );

  const filterByResult = useCallback(
    (games: Result[], filter: FilterResult): Result[] => {
      switch (filter) {
        case FILTER_OPTIONS.WON:
          return games.filter((game) => game.result === true);
        case FILTER_OPTIONS.LOST:
          return games.filter((game) => game.result === false);
        default:
          return games;
      }
    },
    []
  );

  const sortGames = useCallback(
    (games: Result[], sortOption: SortBy): Result[] => {
      return [...games].sort((a, b) => {
        switch (sortOption) {
          case SORT_OPTIONS.DATE_DESC:
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case SORT_OPTIONS.DATE_ASC:
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          case SORT_OPTIONS.NUMBER_DESC:
            return b.generatedNumber - a.generatedNumber;
          case SORT_OPTIONS.NUMBER_ASC:
            return a.generatedNumber - b.generatedNumber;
          default:
            return 0;
        }
      });
    },
    []
  );

  const calculateStats = useCallback((games: Result[]): GameStats => {
    const totalGames = games.length;
    const wonGames = games.filter((game) => game.result === true).length;
    const winRate =
      totalGames > 0 ? Math.round((wonGames / totalGames) * 100) : 0;

    const totalPointsWon = games
      .filter((game) => game.balanceChange > 0)
      .reduce((sum, game) => sum + game.balanceChange, 0);

    const totalPointsLost = Math.abs(
      games
        .filter((game) => game.balanceChange < 0)
        .reduce((sum, game) => sum + game.balanceChange, 0)
    );

    return {
      totalGames,
      wonGames,
      winRate,
      totalPointsWon,
      totalPointsLost,
    };
  }, []);

  const generateCSVContent = useCallback((games: Result[]): string => {
    const rows = [
      CSV_HEADERS,
      ...games.map((game) => [
        new Date(game.date).toLocaleString(DATE_LOCALE),
        game.generatedNumber.toString(),
        game.result ? "Gagné" : "Perdu",
        game.balanceChange.toString(),
        game.newBalance.toString(),
      ]),
    ];
    return rows.map((row) => row.join(",")).join("\n");
  }, []);

  const downloadCSV = useCallback((content: string, filename: string): void => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }, []);

  // Computed values
  const filteredAndSortedHistory = useMemo(() => {
    let filtered = currentHistory;
    filtered = filterBySearch(filtered, searchTerm);
    filtered = filterByResult(filtered, filterResult);
    return sortGames(filtered, sortBy);
  }, [
    currentHistory,
    searchTerm,
    filterResult,
    sortBy,
    filterBySearch,
    filterByResult,
    sortGames,
  ]);

  const gameStats = useMemo(
    () => calculateStats(currentHistory),
    [currentHistory, calculateStats]
  );

  const statCards: StatCard[] = useMemo(
    () => [
      {
        title: "Total parties",
        value: gameStats.totalGames,
        icon: History,
        colorClass: "text-blue-600",
        bgClass: "bg-gradient-to-br from-blue-50 to-indigo-50",
      },
      {
        title: "Taux de réussite",
        value: `${gameStats.winRate}%`,
        subtitle: `${gameStats.wonGames}/${gameStats.totalGames} gagnées`,
        icon: Trophy,
        colorClass: "text-green-600",
        bgClass: "bg-gradient-to-br from-green-50 to-emerald-50",
      },
      {
        title: "Points gagnés",
        value: `+${gameStats.totalPointsWon}`,
        icon: TrendingUp,
        colorClass: "text-emerald-600",
        bgClass: "bg-gradient-to-br from-emerald-50 to-teal-50",
      },
      {
        title: "Points perdus",
        value: `-${gameStats.totalPointsLost}`,
        icon: TrendingDown,
        colorClass: "text-red-600",
        bgClass: "bg-gradient-to-br from-red-50 to-rose-50",
      },
    ],
    [gameStats]
  );

  // Event handlers
  const handleExportCSV = useCallback(() => {
    const csvContent = generateCSVContent(filteredAndSortedHistory);
    const filename = `truenumber-history-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    downloadCSV(csvContent, filename);
  }, [filteredAndSortedHistory, generateCSVContent, downloadCSV]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  // Render helpers
  const renderStatCard = useCallback(
    ({ title, value, subtitle, icon: Icon, colorClass, bgClass }: StatCard) => (
      <Card key={title} className={cn("border-0 shadow-lg", bgClass)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-sm font-medium font-inter", colorClass)}>
                {title}
              </p>
              <p
                className={cn(
                  "text-3xl font-bold font-poppins",
                  colorClass.replace("600", "700")
                )}
              >
                {value}
              </p>
              {subtitle && (
                <p
                  className={cn(
                    "text-xs font-inter",
                    colorClass.replace("600", "500")
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
            <Icon className={cn("w-10 h-10", colorClass)} />
          </div>
        </CardContent>
      </Card>
    ),
    []
  );

  const renderGameItem = useCallback(
    (game: Result, index: number) => (
      <div
        key={`${game.date}-${index}`}
        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-4">
          <div
            className={cn(
              "w-4 h-4 rounded-full",
              game.result ? "bg-green-500" : "bg-red-500"
            )}
          />
          <div className="flex items-center space-x-6">
            <div>
              <p className="text-lg font-bold font-poppins text-gray-900">
                {game.generatedNumber}
              </p>
              <p className="text-sm text-gray-500 font-inter">Nombre généré</p>
            </div>
            <div>
              <Badge
                variant={game.result ? "default" : "destructive"}
                className="font-inter"
              >
                {game.result ? "Gagné" : "Perdu"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p
              className={cn(
                "text-lg font-bold font-poppins",
                game.result ? "text-green-600" : "text-red-600"
              )}
            >
              {game.balanceChange > 0 ? "+" : ""}
              {game.balanceChange} pts
            </p>
            <p className="text-sm text-gray-500 font-inter">
              Solde: {game.newBalance}
            </p>
          </div>
          <div className="text-right min-w-0">
            <div className="flex items-center text-gray-500 text-sm font-inter">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="truncate">
                {new Date(game.date).toLocaleDateString(DATE_LOCALE, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-inter">
              {new Date(game.date).toLocaleTimeString(DATE_LOCALE, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>
    ),
    []
  );

  const renderEmptyState = useCallback(
    () => (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <History className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg font-inter mb-2">
          Aucune partie trouvée
        </p>
        <p className="text-gray-400 text-sm font-inter">
          {searchTerm || filterResult !== FILTER_OPTIONS.ALL
            ? "Essayez de modifier vos filtres de recherche"
            : "Commencez à jouer pour voir votre historique ici !"}
        </p>
      </div>
    ),
    [searchTerm, filterResult]
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold font-poppins mb-2 flex items-center space-x-3">
          <History className="w-8 h-8" />
          <span>Historique des parties</span>
        </h1>
        <p className="text-indigo-100 font-inter">
          Consultez toutes vos parties et analysez vos performances
        </p>
      </header>

      {/* Statistics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(renderStatCard)}
      </section>

      {/* Filters and Controls */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-poppins">Filtrer et trier</CardTitle>
              <CardDescription className="font-inter">
                Trouvez rapidement les parties que vous cherchez
              </CardDescription>
            </div>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="flex items-center space-x-2 font-inter"
              disabled={filteredAndSortedHistory.length === 0}
            >
              <Download className="w-4 h-4" />
              <span>Exporter CSV</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par numéro..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 font-inter"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={filterResult}
                onValueChange={(value: FilterResult) => setFilterResult(value)}
              >
                <SelectTrigger className="w-40 font-inter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FILTER_OPTIONS.ALL}>
                    Tous résultats
                  </SelectItem>
                  <SelectItem value={FILTER_OPTIONS.WON}>Gagnés</SelectItem>
                  <SelectItem value={FILTER_OPTIONS.LOST}>Perdus</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(value: SortBy) => setSortBy(value)}
              >
                <SelectTrigger className="w-48 font-inter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SORT_OPTIONS.DATE_DESC}>
                    Plus récent d&apos;abord
                  </SelectItem>
                  <SelectItem value={SORT_OPTIONS.DATE_ASC}>
                    Plus ancien d&apos;abord
                  </SelectItem>
                  <SelectItem value={SORT_OPTIONS.NUMBER_DESC}>
                    Nombre décroissant
                  </SelectItem>
                  <SelectItem value={SORT_OPTIONS.NUMBER_ASC}>
                    Nombre croissant
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="font-poppins">
            Historique complet ({filteredAndSortedHistory.length} partie
            {filteredAndSortedHistory.length !== 1 ? "s" : ""})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSortedHistory.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredAndSortedHistory.map(renderGameItem)}
            </div>
          ) : (
            renderEmptyState()
          )}
        </CardContent>
      </Card>
    </div>
  );
}
