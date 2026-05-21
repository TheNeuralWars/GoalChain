using UnityEngine;
using UnityEngine.UI;
using TMPro; // Usamos TextMeshPro para textos de alta calidad
using GoalChain.Models;

namespace GoalChain.UI
{
    public class PenaltyUI : MonoBehaviour
    {
        [Header("Scoreboard UI")]
        public TextMeshProUGUI localPlayerNameText;
        public TextMeshProUGUI opponentPlayerNameText;
        public TextMeshProUGUI localScoreText;
        public TextMeshProUGUI opponentScoreText;
        public TextMeshProUGUI roundText;

        [Header("Match Info UI")]
        public TextMeshProUGUI matchStatusText; // Ej: "¡Turno de Patear!"
        public TextMeshProUGUI wagerAmountText; // Ej: "Pozo: 100 GCH"

        [Header("Action Controls")]
        public Button leftShootButton;
        public Button centerShootButton;
        public Button rightShootButton;

        /// <summary>
        /// Inicializa los datos visuales de la pantalla antes del partido
        /// </summary>
        public void InitializeMatchUI(ParodyPlayer local, ParodyPlayer opponent, ulong wagerAmount)
        {
            localPlayerNameText.text = local.Name;
            opponentPlayerNameText.text = opponent.Name;
            wagerAmountText.text = $"POZO TOTAL: {wagerAmount * 2} GCH";
            
            UpdateScore(0, 0, 1);
            SetStatusMessage("¡El partido está por comenzar!");
        }

        public void UpdateScore(int localScore, int opponentScore, int currentRound)
        {
            localScoreText.text = localScore.ToString();
            opponentScoreText.text = opponentScore.ToString();
            roundText.text = $"RONDA {currentRound}";
        }

        public void SetStatusMessage(string message)
        {
            matchStatusText.text = message;
        }

        /// <summary>
        /// Activa o desactiva los botones de disparo dependiendo de si es tu turno
        /// </summary>
        public void ToggleShootControls(bool isEnabled)
        {
            leftShootButton.interactable = isEnabled;
            centerShootButton.interactable = isEnabled;
            rightShootButton.interactable = isEnabled;
        }

        // Animaciones simples de UI
        public void ShowGoalAnimation()
        {
            // Aquí llamaríamos a un Animator de Unity para hacer parpadear la pantalla de verde
            SetStatusMessage("<color=green>¡GOOOOOOOL!</color>");
        }

        public void ShowMissAnimation()
        {
            SetStatusMessage("<color=red>¡ATAJADA!</color>");
        }
    }
}
