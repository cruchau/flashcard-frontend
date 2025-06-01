// Frontend (React) — Ajout du bouton toggle dark mode
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function FlashcardApp() {
  const [reviewCard, setReviewCard] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [editCard, setEditCard] = useState(null);
  const [cards, setCards] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const fetchCards = async () => {
    const res = await fetch("/api/cards");
    const data = await res.json();
    setCards(data);
  };

  const fetchReviewCard = async () => {
    const res = await fetch("/api/review");
    if (res.ok) {
      const data = await res.json();
      setReviewCard(data);
      setShowAnswer(false);
    }
  };

  const reviewResponse = async (correct) => {
    if (!reviewCard) return;
    await fetch(`/api/cards/${reviewCard.id}/review?correct=${correct}`, {
      method: "POST",
    });
    setReviewCard(null);
    fetchReviewCard();
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", csvFile);
    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    setCsvFile(null);
    alert("Importation réussie");
    fetchCards();
  };

  const updateCard = async () => {
    if (!editCard) return;
    await fetch(`/api/cards/${editCard.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editCard),
    });
    alert("Carte mise à jour");
    setEditCard(null);
    fetchCards();
  };

  const deleteCard = async (id) => {
    if (!window.confirm("Supprimer cette carte ?")) return;
    await fetch(`/api/cards/${id}`, { method: "DELETE" });
    fetchCards();
  };

  const filteredCards = cards.filter((card) => {
    const target = `${card.course} ${card.chapter} ${card.notion} ${card.question} ${card.answer}`.toLowerCase();
    return target.includes(filterText.toLowerCase());
  });

  const totalCards = cards.length;
  const avgScore = totalCards ? (cards.reduce((sum, c) => sum + c.score, 0) / totalCards).toFixed(2) : 0;
  const lowScoreCount = cards.filter(c => c.score <= 1).length;

  return (
    <div className="p-6 space-y-8 bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🎓 Application de Flashcards</h1>
        <Button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ Mode clair" : "🌙 Mode sombre"}
        </Button>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-2">📊 Statistiques</h2>
        <p>Total de cartes : {totalCards}</p>
        <p>Score moyen : {avgScore}</p>
        <p>Cartes à réviser (score ≤ 1) : {lowScoreCount}</p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">🧠 Révision (Mode Quiz)</h2>
        {reviewCard ? (
          <Card className="p-4">
            <CardContent>
              <p className="mb-2 font-semibold">
                {reviewCard.course} > {reviewCard.chapter} > {reviewCard.notion}
              </p>
              <p><strong>Q:</strong> {reviewCard.question}</p>
              {!showAnswer ? (
                <Button className="mt-3" onClick={() => setShowAnswer(true)}>Afficher la réponse</Button>
              ) : (
                <>
                  <p><strong>R:</strong> {reviewCard.answer}</p>
                  <div className="mt-3 space-x-2">
                    <Button onClick={() => reviewResponse(true)}>👍 Bonne réponse</Button>
                    <Button onClick={() => reviewResponse(false)} variant="destructive">👎 Mauvaise réponse</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Button onClick={fetchReviewCard}>Commencer la révision</Button>
        )}
      </section>

      {/* Gestion des cartes à compléter selon besoin */}
    </div>
  );
}
