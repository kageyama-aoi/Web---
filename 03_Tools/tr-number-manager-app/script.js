document.addEventListener('DOMContentLoaded', () => {
    const trNumberDisplay = document.getElementById('trNumberDisplay');
    const dataInput = document.getElementById('dataInput');
    const processDataButton = document.getElementById('processDataButton');
    const clearInputButton = document.getElementById('clearInputButton');
    const resultOutput = document.getElementById('resultOutput');
    const statusMessage = document.getElementById('statusMessage');

    // --- TR Number Management --- です
    const MY_TR_NUMBER_KEY = 'MyTrNumber';

    function loadTrNumber() {
        const storedTrNumber = localStorage.getItem(MY_TR_NUMBER_KEY);
        if (storedTrNumber) {
            trNumberDisplay.textContent = storedTrNumber;
            updateStatus(`TR番号をロードしました: ${storedTrNumber}`);
        } else {
            trNumberDisplay.textContent = '未設定';
            updateStatus('TR番号はまだ設定されていません。');
        }
    }

    // Function to save TR number (e.g., from URL, though not implemented yet)
    function saveTrNumber(trNumber) {
        localStorage.setItem(MY_TR_NUMBER_KEY, trNumber);
        trNumberDisplay.textContent = trNumber;
        updateStatus(`TR番号を保存しました: ${trNumber}`);
    }

    // Example: You might add a way to set this, e.g., from a URL parameter
    // For now, let's just load it on startup.

    // --- Button Actions ---
    processDataButton.addEventListener('click', () => {
        const inputData = dataInput.value;
        if (inputData.trim() === '') {
            resultOutput.value = 'データが入力されていません。';
            updateStatus('処理失敗: 入力データなし');
            return;
        }

        // Placeholder for actual data processing
        // For now, just echo the input to the output area
        resultOutput.value = `入力されたデータ:\n${inputData}`;
        updateStatus('データを処理しました。');
    });

    clearInputButton.addEventListener('click', () => {
        dataInput.value = '';
        resultOutput.value = '';
        updateStatus('入力と結果をクリアしました。');
    });

    // --- Status Update ---
    function updateStatus(message) {
        statusMessage.textContent = message;
    }

    // Initial load
    loadTrNumber();
});