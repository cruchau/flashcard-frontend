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
  const avgScore = totalCards
    ? (cards.reduce((sum, c) => sum + c.score, 0) / totalCards).toFixed(2)
    : 0;
  const lowScoreCount = cards.filter((c) => c.score <= 1).length;

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
                {reviewCard.course} &gt; {reviewCard.chapter} &gt; {reviewCard.notion}
              </p>
              <p><strong>Q:</strong> {reviewCard.question}</p>
              {!showAnswer ? (
                <Button className="mt-3" onClick={() => setShowAnswer(true)}>
                  Afficher la réponse
                </Button>
              ) : (
                <>
                  <p><strong>R:</strong> {reviewCard.answer}</p>
                  <div className="mt-3 space-x-2">
                    <Button onClick={() => reviewResponse(true)}>👍 Bonne réponse</Button>
                    <Button onClick={() => reviewResponse(false)} variant="destructive">
                      👎 Mauvaise réponse
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Button onClick={fetchReviewCard}>Commencer la révision</Button>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">📂 Importation CSV</h2>
        <form onSubmit={handleCsvUpload} className="flex items-center gap-2">
          <Input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} />
          <Button type="submit">Importer</Button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">🔍 Rechercher des cartes</h2>
        <Input
          type="text"
          placeholder="Filtrer les cartes..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <ul className="mt-4 space-y-2">
          {filteredCards.map((card) => (
            <li key={card.id} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
              <div className="font-semibold">
                {card.course} &gt; {card.chapter} &gt; {card.notion}
              </div>
              <div><strong>Q:</strong> {card.question}</div>
              <div><strong>R:</strong> {card.answer}</div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => setEditCard(card)}>✏️ Modifier</Button>
                <Button size="sm" variant="destructive" onClick={() => deleteCard(card.id)}>🗑️ Supprimer</Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {editCard && (
        <section>
          <h2 className="text-xl font-bold mb-2">✏️ Modifier une carte</h2>
          <div className="space-y-2">
            <Input
              value={editCard.question}
              onChange={(e) => setEditCard({ ...editCard, question: e.target.value })}
              placeholder="Question"
            />
            <Textarea
              value={editCard.answer}
              onChange={(e) => setEditCard({ ...editCard, answer: e.target.value })}
              placeholder="Réponse"
            />
            <Button onClick={updateCard}>💾 Enregistrer</Button>
            <Button variant="outline" onClick={() => setEditCard(null)}>❌ Annuler</Button>
          </div>
        </section>
      )}
    </div>
  );
}
