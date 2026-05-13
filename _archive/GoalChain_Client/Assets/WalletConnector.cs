using UnityEngine;
using UnityEngine.UI;
using TMPro;
using Solana.Unity.Wallet;
using Solana.Unity.Wallet.Bip39;
using Solana.Unity.SDK; // MagicBlock SDK
using System.Threading.Tasks;

namespace GoalChain.UI
{
    public class WalletConnector : MonoBehaviour
    {
        [Header("UI Elements")]
        public Button connectButton;
        public TextMeshProUGUI walletAddressText;

        void Start()
        {
            // Asegurarnos de que el botón escuche nuestro click
            if (connectButton != null)
            {
                connectButton.onClick.AddListener(OnConnectWalletClicked);
            }

            // Si el usuario ya estaba conectado de una sesión anterior
            if (Web3.Wallet != null && Web3.Wallet.Account != null)
            {
                UpdateUI(Web3.Wallet.Account.PublicKey.ToString());
            }
        }

        public async void OnConnectWalletClicked()
        {
            Debug.Log("Iniciando conexión a Wallet Web3...");
            
            // En un build de Android/PSG1, esto abrirá la wallet nativa (Mobile Wallet Adapter).
            // En el editor de Unity, crearemos una "Burner Wallet" de prueba para no crashear.
#if UNITY_EDITOR || UNITY_STANDALONE
            Debug.Log("Modo Editor detectado: Intentando cargar billetera local...");
            var account = await Web3.Instance.LoginInGameWallet("TestPassword123!");
            
            if (account == null)
            {
                Debug.Log("No se encontró billetera local. Creando una nueva de prueba con frase semilla...");
                var mnemonic = new Mnemonic(WordList.English, WordCount.Twelve);
                account = await Web3.Instance.CreateAccount(mnemonic.ToString(), "TestPassword123!");
            }
#else
            var account = await Web3.Instance.LoginWalletAdapter();
#endif

            if (account != null)
            {
                Debug.Log($"¡Wallet conectada exitosamente! PubKey: {account.PublicKey}");
                UpdateUI(account.PublicKey.ToString());
                
                // Aquí podrías cargar el balance del usuario:
                // double balance = await Web3.Instance.Rpc.GetBalanceAsync(account.PublicKey);
            }
            else
            {
                Debug.LogError("Error al conectar la wallet o el usuario canceló.");
            }
        }

        private void UpdateUI(string pubKey)
        {
            if (walletAddressText != null)
            {
                // Mostramos solo el principio y el final de la wallet (ej: 7xK9...2aB1)
                string shortAddress = $"{pubKey.Substring(0, 4)}...{pubKey.Substring(pubKey.Length - 4)}";
                walletAddressText.text = $"Conectado: {shortAddress}";
                walletAddressText.color = Color.green;
            }
            
            if (connectButton != null)
            {
                connectButton.gameObject.SetActive(false); // Ocultamos el botón tras conectar
            }
        }
    }
}
