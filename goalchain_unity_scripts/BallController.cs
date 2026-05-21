using System.Collections;
using UnityEngine;

namespace GoalChain.GamePlay
{
    [RequireComponent(typeof(Rigidbody))]
    public class BallController : MonoBehaviour
    {
        private Rigidbody rb;
        private Vector3 startPosition;

        [Header("Physics Settings")]
        public float baseKickForce = 15f;
        public float upwardForce = 3f;

        void Awake()
        {
            rb = GetComponent<Rigidbody>();
            startPosition = transform.position;
        }

        /// <summary>
        /// Aplica fuerza física a la pelota basada en si el código decidió que era Gol o Atajada
        /// </summary>
        public void KickBall(bool isGoal, float shotPowerModifier)
        {
            // Reseteamos cualquier movimiento anterior
            rb.velocity = Vector3.zero;
            rb.angularVelocity = Vector3.zero;
            transform.position = startPosition;

            // Calculamos la dirección del arco (Z es hacia adelante en Unity por defecto)
            Vector3 targetDirection = Vector3.forward;

            if (isGoal)
            {
                // Si es gol, desviamos un poco a la izquierda o derecha al azar (esquinas)
                float randomX = Random.Range(-1.5f, 1.5f);
                targetDirection = new Vector3(randomX, 0.5f, 1).normalized;
            }
            else
            {
                // Si la falla o el arquero la ataja, pateamos al centro o muy desviado
                float missX = Random.value > 0.5f ? 3f : -3f; // Fuera del arco
                targetDirection = new Vector3(missX, 0.5f, 1).normalized;
            }

            // Aplicar la fuerza final influenciada por el atributo On-Chain
            float finalForce = baseKickForce * (1f + shotPowerModifier);
            Vector3 forceToApply = (targetDirection * finalForce) + (Vector3.up * upwardForce);

            rb.AddForce(forceToApply, ForceMode.Impulse);
            
            // Añadir un poco de efecto/rotación (Spin) a la pelota
            rb.AddTorque(new Vector3(Random.Range(-5f, 5f), 0, Random.Range(-5f, 5f)), ForceMode.Impulse);
        }

        public void ResetBall()
        {
            rb.velocity = Vector3.zero;
            rb.angularVelocity = Vector3.zero;
            transform.position = startPosition;
        }
    }
}
