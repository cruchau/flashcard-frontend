import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetch("/api/cards")
      .then((res) => res.json())
      .then(setCards);
  }, []);

  const byCourse = cards.reduce((acc, card) => {
    if (!acc[card.course]) acc[card.course] = [];
    acc[card.course].push(card);
    return acc;
  }, {});

  const chartData = Object.entries(byCourse).map(([course, items]) => ({
    course,
    score: +(items.reduce((sum, c) => sum + c.score, 0) / items.length).toFixed(2),
    count: items.length,
  }));

  const lowScoreCards = cards.filter((c) => c.score <= 1);

  return (
    <div className="p-6 space-y-8 bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <h1 className="text-2xl font-bold">📊 Tableau de bord</h1>

      <Card className="p-4">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">📚 Moyenne des scores par cours</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="course" stroke={getComputedStyle(document.documentElement).getPropertyValue("--color-text") || "#000"} />
              <YAxis stroke={getComputedStyle(document.documentElement).getPropertyValue("--color-text") || "#000"} />
              <Tooltip />
              <Bar dataKey="score" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">⚠️ Cartes à réviser (score ≤ 1)</h2>
          <ul className="list-disc ml-6">
            {lowScoreCards.map((card) => (
              <li key={card.id} className="text-sm">
                {card.course} &gt; {card.chapter} &gt; {card.notion}: {card.question}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
