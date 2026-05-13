using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using GoalChain.Models;
using GoalChain.Managers;
using GoalChain.UI;

namespace GoalChain.GamePlay
{
    public class PenaltyGameMode : MonoBehaviour
    {
        [Header("Managers Reference")]
        public WagerManager wagerManager;
        public PenaltyUI uiManager;

        [Header("Match Settings")]
        public int totalRounds = 5;
        
        [Header("Players Data (NFTs)")]
        public ParodyPlayer localPlayerNFT; // Ej: "Lionel Bitcoin"
        public ParodyPlayer opponentPlayerNFT;

        // Estado del partido
        private int currentRound = 1;
        private int localScore = 0;
        private int opponentScore = 0;
        private bool isLocalTurnToShoot = true; // Empieza pateando el local

        // MOCK DE PRUEBA: Autoiniciar partido al darle Play
        void Start()
        {
            var p1 = ParodyPlayer.Deserialize(null); 
            var p2 = new ParodyPlayer() { Name = "Cristiano HODLdo", ShotPower = 90 };
            StartPenaltyMatch(p1, p2);
        }

        public void StartPenaltyMatch(ParodyPlayer local, ParodyPlayer opponent)
        {
            localPlayerNFT = local;
            opponentPlayerNFT = opponent;
            currentRound = 1;
            localScore = 0;
            opponentScore = 0;
            isLocalTurnToShoot = true;

            Debug.Log($"¡El partido comienza! {local.Name} vs {opponent.Name}");
            if (uiManager != null) uiManager.InitializeMatchUI(local, opponent, 50);

            NextTurn();
        }

        private void NextTurn()
        {
            if (currentRound > totalRounds)
            {
                CheckWinnerAndResolve();
                return;
            }

            if (uiManager != null) uiManager.UpdateScore(localScore, opponentScore, currentRound);

            if (isLocalTurnToShoot)
            {
                string msg = $"[Ronda {currentRound}] ¡Es tu turno de Patear!";
                Debug.Log(msg);
                if (uiManager != null) uiManager.SetStatusMessage(msg);
                
                // Aquí se activaría la UI o Input de PlaySolana PSG1 para elegir dirección
                SimulateShootAction(localPlayerNFT, true);
            }
            else
            {
                string msg = $"[Ronda {currentRound}] ¡Turno de Atajar!";
                Debug.Log(msg);
                if (uiManager != null) uiManager.SetStatusMessage(msg);

                // Input para que el portero se lance
                SimulateShootAction(opponentPlayerNFT, false);
            }
        }

        /// <summary>
        /// Simulación de un tiro basado en Input direccional y atributos del NFT.
        /// </summary>
        public void SimulateShootAction(ParodyPlayer shooter, bool isLocal)
        {
            // Fórmula Lógica: 
            // Posibilidad Base = 50%. Se suma o resta según la Potencia de Tiro (ShotPower)
            // Si Messi hizo un gol ayer en la vida real, tiene más ShotPower y más % de meter el gol.
            
            float baseChance = 0.5f;
            float shotBonus = (shooter.ShotPower * 0.02f); // +2% chance por cada punto de ShotPower
            float finalGoalChance = baseChance + shotBonus;

            float randomRoll = Random.Range(0f, 1f);
            bool isGoal = randomRoll <= finalGoalChance;

            if (isGoal)
            {
                Debug.Log($"¡GOOOOOOOL de {shooter.Name}! (Poder del tiro influyó {shotBonus * 100}%)");
                if (uiManager != null) uiManager.ShowGoalAnimation();
                if (isLocal) localScore++; else opponentScore++;
            }
            else
            {
                Debug.Log($"¡ATAJADÓN! {shooter.Name} ha fallado.");
                if (uiManager != null) uiManager.ShowMissAnimation();
            }

            if (uiManager != null) uiManager.UpdateScore(localScore, opponentScore, currentRound);

            // Cambiar turno
            if (!isLocalTurnToShoot)
            {
                currentRound++; // La ronda avanza cuando ambos patearon
            }
            
            isLocalTurnToShoot = !isLocalTurnToShoot;
            
            // Pausa pequeña antes del siguiente tiro
            StartCoroutine(DelayNextTurn());
        }

        private IEnumerator DelayNextTurn()
        {
            yield return new WaitForSeconds(2.5f);
            NextTurn();
        }

        private void CheckWinnerAndResolve()
        {
            string result = $"Resultado Final: Tú {localScore} - {opponentScore} Oponente";
            Debug.Log(result);

            if (localScore > opponentScore)
            {
                if (uiManager != null) uiManager.SetStatusMessage($"<color=yellow>¡GANASTE LA APUESTA!</color>\n{result}");
                if (wagerManager != null) wagerManager.ResolveWagerAsync(winnerIsLocal: true);
            }
            else if (opponentScore > localScore)
            {
                if (uiManager != null) uiManager.SetStatusMessage($"<color=red>PERDISTE LA APUESTA.</color>\n{result}");
                if (wagerManager != null) wagerManager.ResolveWagerAsync(winnerIsLocal: false);
            }
            else
            {
                if (uiManager != null) uiManager.SetStatusMessage("¡EMPATE! Entrando a Muerte Súbita...");
                totalRounds++; // Agrega una ronda más
                NextTurn();
            }
        }
    }
}
