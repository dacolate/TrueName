"use client";

import { User } from "@/lib/auth";
import { Result } from "@/types";
import { useState, useCallback } from "react";
import { addGameResult, increaseUserBalance } from "@/app/actions";
import { useUserBalance, useGameHistory } from "@/hooks/useGameData";

// UI Components
import { Button } from "../ui/button";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardHeader,
} from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";

// Icons
import {
  Coins,
  TrendingDown,
  Trophy,
  History,
  Zap,
  Target,
  BarChart3,
} from "lucide-react";

// Utils
import { cn } from "@/lib/utils";

// Constants
const GAME_CONFIG = {
  WINNING_THRESHOLD: 70,
  WIN_REWARD: 50,
  LOSS_PENALTY: -35,
  GAME_DELAY: 0,
  UI_UPDATE_DELAY: 200,
  RECENT_GAMES_COUNT: 3,
} as const;

// Types
interface GameDashboardProps {
  user: User;
  gameHistory?: Result[];
}

interface GameStats {
  totalGames: number;
  wonGames: number;
  winRate: number;
}

interface GameOutcome {
  generatedNumber: number;
  result: boolean;
  balanceChange: number;
  newBalance: number;
  date: Date;
  userId: string;
}

// Custom Hooks
const useGameStats = (gameHistory: Result[]): GameStats => {
  const totalGames = gameHistory.length;
  const wonGames = gameHistory.filter((game) => game.result).length;
  const winRate =
    totalGames > 0 ? Math.round((wonGames / totalGames) * 100) : 0;

  return { totalGames, wonGames, winRate };
};

// Utility Functions
const generateRandomNumber = (): number => Math.floor(Math.random() * 101);

const createGameOutcome = (
  generatedNumber: number,
  currentBalance: number,
  userId: string
): GameOutcome => {
  const won = generatedNumber > GAME_CONFIG.WINNING_THRESHOLD;
  const balanceChange = won ? GAME_CONFIG.WIN_REWARD : GAME_CONFIG.LOSS_PENALTY;

  return {
    generatedNumber,
    result: won,
    balanceChange,
    newBalance: currentBalance + balanceChange,
    date: new Date(),
    userId,
  };
};

const createGameHistoryEntry = (outcome: GameOutcome): Result => ({
  date: outcome.date,
  generatedNumber: outcome.generatedNumber,
  result: outcome.result,
  balanceChange: outcome.balanceChange,
  newBalance: outcome.newBalance,
  userId: outcome.userId,
});

// Sub-components
const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}) => (
  <Card className="border-0 shadow-lg bg-gradient-to-br from-opacity-50">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium font-inter ${colorClass}-600`}>
            {title}
          </p>
          <p className={`text-3xl font-bold font-poppins ${colorClass}-700`}>
            {value}
          </p>
          <p className={`text-sm font-inter ${colorClass}-500`}>{subtitle}</p>
        </div>
        <Icon className={`w-12 h-12 ${colorClass}-600`} />
      </div>
    </CardContent>
  </Card>
);

const GameResult = ({ gameResult }: { gameResult: GameOutcome }) => (
  <Alert
    className={cn(
      "border-2 rounded-xl p-6 transition-all duration-300",
      gameResult.result
        ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50"
        : "border-red-200 bg-gradient-to-r from-red-50 to-rose-50"
    )}
  >
    <AlertDescription className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div
          className={cn(
            "p-3 rounded-full",
            gameResult.result ? "bg-green-100" : "bg-red-100"
          )}
        >
          {gameResult.result ? (
            <Trophy className="w-6 h-6 text-green-600" />
          ) : (
            <TrendingDown className="w-6 h-6 text-red-600" />
          )}
        </div>
        <div>
          <span
            className={cn(
              "text-lg font-bold font-poppins",
              gameResult.result ? "text-green-800" : "text-red-800"
            )}
          >
            {gameResult.result
              ? "🎉 Félicitations ! Vous avez gagné !"
              : "😔 Dommage ! Vous avez perdu !"}
          </span>
          <p
            className={cn(
              "text-sm font-inter",
              gameResult.result ? "text-green-600" : "text-red-600"
            )}
          >
            {gameResult.result
              ? `Votre nombre était supérieur à ${GAME_CONFIG.WINNING_THRESHOLD} !`
              : `Votre nombre était inférieur ou égal à ${GAME_CONFIG.WINNING_THRESHOLD}.`}
          </p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-4xl font-bold font-poppins text-gray-900 mb-1">
          {gameResult.generatedNumber}
        </div>
        <div
          className={cn(
            "text-lg font-semibold font-inter",
            gameResult.result ? "text-green-600" : "text-red-600"
          )}
        >
          {gameResult.balanceChange > 0 ? "+" : ""}
          {gameResult.balanceChange} points
        </div>
      </div>
    </AlertDescription>
  </Alert>
);

const GameHistoryItem = ({ game }: { game: Result }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex items-center space-x-3">
      <div
        className={cn(
          "w-3 h-3 rounded-full",
          game.result ? "bg-green-500" : "bg-red-500"
        )}
      />
      <div>
        <div className="font-medium text-gray-900 font-inter">
          {game.generatedNumber}
        </div>
        <div className="text-xs text-gray-500 font-inter">
          {new Date(game.date).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
    <div className="text-right">
      <div
        className={cn(
          "font-semibold text-sm font-inter",
          game.result ? "text-green-600" : "text-red-600"
        )}
      >
        {game.result ? "Gagné" : "Perdu"}
      </div>
      <div className="text-xs text-gray-500 font-inter">
        {game.balanceChange > 0 ? "+" : ""}
        {game.balanceChange} pts
      </div>
    </div>
  </div>
);

const EmptyGameHistory = () => (
  <div className="text-center py-8">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <History className="w-8 h-8 text-gray-400" />
    </div>
    <p className="text-gray-500 text-sm font-inter">
      Aucune partie jouée pour le moment
    </p>
    <p className="text-gray-400 text-xs font-inter mt-1">
      Commencez à jouer pour voir votre historique ici !
    </p>
  </div>
);

// Main Component
export default function GameDashboard({
  user,
  gameHistory: initialHistory = [],
}: GameDashboardProps) {
  // State
  const [gameResult, setGameResult] = useState<GameOutcome | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setIsUpdating] = useState(false);

  // Data fetching hooks
  const { balance, mutate: mutateBalance } = useUserBalance(user?.id || "");
  const { gameHistory, mutate: mutateHistory } = useGameHistory(user?.id || "");

  // Computed values
  const currentBalance = balance ?? user?.balance ?? 0;
  const currentHistory = gameHistory?.length > 0 ? gameHistory : initialHistory;
  const stats = useGameStats(currentHistory);
  const recentGames = currentHistory.slice(0, GAME_CONFIG.RECENT_GAMES_COUNT);

  // Handlers
  const handleOptimisticUpdate = useCallback(
    (outcome: GameOutcome) => {
      // Update balance optimistically
      mutateBalance({ balance: outcome.newBalance }, false);

      // Update game history optimistically
      const newGame = createGameHistoryEntry(outcome);
      mutateHistory((data: { gameHistory: Result[] }) => {
        const currentGames = data?.gameHistory || currentHistory;
        return { gameHistory: [newGame, ...currentGames] };
      }, false);
    },
    [mutateBalance, mutateHistory, currentHistory]
  );

  const handleServerUpdate = useCallback(
    async (outcome: GameOutcome) => {
      try {
        const [gameResultResponse, balanceUpdateResponse] = await Promise.all([
          addGameResult(outcome),
          increaseUserBalance(outcome.userId, outcome.balanceChange),
        ]);

        const isSuccess =
          gameResultResponse.success && balanceUpdateResponse.success;

        if (isSuccess) {
          setTimeout(() => {
            setIsUpdating(false);
            mutateBalance();
            mutateHistory();
          }, GAME_CONFIG.UI_UPDATE_DELAY);
        } else {
          console.error("Server update failed:", {
            gameResultResponse,
            balanceUpdateResponse,
          });
          throw new Error("Server update failed");
        }
      } catch (error) {
        console.error("Error updating game data:", error);
        // Revert optimistic updates on error
        mutateBalance();
        mutateHistory();
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [mutateBalance, mutateHistory]
  );

  const playGame = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setGameResult(null);
    setIsUpdating(true);

    try {
      // Simulate game play
      await new Promise((resolve) =>
        setTimeout(resolve, GAME_CONFIG.GAME_DELAY)
      );

      const generatedNumber = generateRandomNumber();
      const outcome = createGameOutcome(
        generatedNumber,
        currentBalance,
        user.id
      );

      setGameResult(outcome);
      setLoading(false);

      // Optimistic update
      handleOptimisticUpdate(outcome);

      // Server update
      await handleServerUpdate(outcome);
    } catch (error) {
      console.error("Game play failed:", error);
    } finally {
      // setLoading(false); // removed here because otherwise the loading state would be too long
    }
  }, [user?.id, currentBalance, handleOptimisticUpdate, handleServerUpdate]);

  const navigateToHistory = useCallback(() => {
    window.location.href = "/history";
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold font-poppins mb-2">
          Bienvenue, {user?.name} ! 👋
        </h1>
        <p className="text-blue-100 font-inter">
          Tentez votre chance avec TrueNumber. Générez un nombre supérieur à{" "}
          {GAME_CONFIG.WINNING_THRESHOLD} pour gagner !
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Game Section */}
        <div className="xl:col-span-3 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Solde actuel"
              value={currentBalance}
              subtitle="points"
              icon={Coins}
              colorClass="text-green"
            />
            <StatsCard
              title="Parties jouées"
              value={stats.totalGames}
              subtitle="au total"
              icon={Target}
              colorClass="text-blue"
            />
            <StatsCard
              title="Taux de réussite"
              value={`${stats.winRate}%`}
              subtitle="victoires"
              icon={BarChart3}
              colorClass="text-purple"
            />
          </div>

          {/* Game Card */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold font-poppins text-gray-900">
                <span className="px-1 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                  Jeu TrueNumber
                </span>
              </CardTitle>
              <CardDescription className="text-lg font-inter text-gray-600">
                Générez un nombre entre 0 et 100. Gagnez si c&apos;est supérieur
                à {GAME_CONFIG.WINNING_THRESHOLD} !
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Game Result */}
              {gameResult && <GameResult gameResult={gameResult} />}

              {/* Play Button */}
              <div className="text-center py-2">
                <Button
                  onClick={playGame}
                  disabled={loading}
                  size="lg"
                  className={cn(
                    "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                    "text-white font-semibold px-12 py-4 rounded-xl transition-all duration-300",
                    "transform hover:scale-105 shadow-lg hover:shadow-xl",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                    "font-inter text-lg cursor-pointer"
                  )}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Génération en cours...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>Générer un nombre</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Recent Games */}
        <div className="xl:col-span-1">
          <Card className="border-0 shadow-lg sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 font-poppins">
                <History className="w-5 h-5 text-blue-600" />
                <span>Parties récentes</span>
              </CardTitle>
              <CardDescription className="font-inter">
                Vos {GAME_CONFIG.RECENT_GAMES_COUNT} dernières parties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentGames.length > 0 ? (
                  recentGames.map((game: Result, index: number) => (
                    <GameHistoryItem key={index} game={game} />
                  ))
                ) : (
                  <EmptyGameHistory />
                )}
              </div>

              {recentGames.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="w-full font-inter text-sm cursor-pointer"
                    onClick={navigateToHistory}
                  >
                    Voir tout l&apos;historique
                    <History className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
