
// frontend/src/HierarchyPage.jsx — Vue hiérarchique Cours > Chapitres > Notions
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HierarchyPage() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetch("/api/cards")
      .then((res) => res.json())
      .then(setCards);
  }, []);

  const hierarchy = {};
  for (const card of cards) {
    if (!hierarchy[card.course]) hierarchy[card.course] = {};
    if (!hierarchy[card.course][card.chapter]) hierarchy[card.course][card.chapter] = {};
    if (!hierarchy[card.course][card.chapter][card.notion]) hierarchy[card.course][card.chapter][card.notion] = [];
    hierarchy[card.course][card.chapter][card.notion].push(card);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">📚 Gestion des cours & chapitres</h1>
      {Object.entries(hierarchy).map(([course, chapters]) => (
        <Card key={course} className="p-4">
          <CardContent>
            <h2 className="text-xl font-semibold">📘 {course}</h2>
            {Object.entries(chapters).map(([chapter, notions]) => (
              <div key={chapter} className="ml-4 mt-2">
                <h3 className="text-lg font-medium">📖 {chapter}</h3>
                {Object.entries(notions).map(([notion, cards]) => (
                  <div key={notion} className="ml-4 mt-1">
                    <p className="font-medium">🔹 {notion}</p>
                    <ul className="list-disc ml-5">
                      {cards.map((card) => (
                        <li key={card.id} className="text-sm">{card.question}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
