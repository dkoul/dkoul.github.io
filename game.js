const generateColorVariations = (baseColor) => {
    const colors = [baseColor];
    for (let i = 0; i < 3; i++) {
      const variation = baseColor.map(val => 
        Math.min(255, Math.max(0, val + Math.floor(Math.random() * 40) - 20))
      );
      colors.push(variation);
    }
    return colors.sort(() => Math.random() - 0.5);
  };
  
  const TutorialStep = ({ step, onClose }) => {
    const steps = [
      {
        title: "Welcome to ColorChain!",
        description: "Match the sequence of colors one by one. You'll see the full sequence when you complete the game."
      },
      {
        title: "How to Play",
        description: "For each position, choose the correct color from four similar options. You'll get immediate feedback on your choice."
      },
      {
        title: "Sharing",
        description: "Share your results when you're done! Your sequence will be shown as colored circles, just like Wordle."
      }
    ];
  
    return (
      <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{steps[step].title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <p className="mt-2 text-gray-600">{steps[step].description}</p>
      </div>
    );
  };
  
  const ColorChain = () => {
    const [gameState, setGameState] = React.useState({
      sequence: [],
      options: [],
      currentRound: 0,
      guesses: [],
      gameOver: false,
      won: false
    });
    const [showTutorial, setShowTutorial] = React.useState(true);
    const [tutorialStep, setTutorialStep] = React.useState(0);
    const [copyFeedback, setCopyFeedback] = React.useState('');
  
    React.useEffect(() => {
      const sequence = Array(5).fill(0).map(() => [
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255)
      ]);
      
      const options = sequence.map(color => generateColorVariations(color));
      
      setGameState(prev => ({
        ...prev,
        sequence,
        options,
        guesses: Array(5).fill(null)
      }));
  
      const hasPlayed = localStorage.getItem('colorchain_played');
      if (hasPlayed) {
        setShowTutorial(false);
      }
    }, []);
  
    const handleColorSelect = (colorIndex) => {
      if (gameState.gameOver || gameState.currentRound >= 5) return;
  
      const newGuesses = [...gameState.guesses];
      newGuesses[gameState.currentRound] = colorIndex;
  
      const isCorrect = colorIndex === 0;
      
      const newState = {
        ...gameState,
        guesses: newGuesses,
        currentRound: gameState.currentRound + 1
      };
  
      if (gameState.currentRound === 4) {
        newState.gameOver = true;
        newState.won = newGuesses.every(guess => guess === 0);
        localStorage.setItem('colorchain_played', 'true');
      }
  
      setGameState(newState);
    };
  
    const handleShare = async () => {
      const results = gameState.guesses.map(guess => 
        guess === 0 ? "🟢" : guess === null ? "⚪" : "🔴"
      ).join("");
      
      const shareText = `ColorChain ${new Date().toLocaleDateString()}\n${results}`;
  
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'ColorChain',
            text: shareText,
          });
        } catch (err) {
          console.log('Error sharing:', err);
        }
      } else {
        try {
          await navigator.clipboard.writeText(shareText);
          setCopyFeedback('Copied!');
          setTimeout(() => setCopyFeedback(''), 2000);
        } catch (err) {
          setCopyFeedback('Failed to copy');
          setTimeout(() => setCopyFeedback(''), 2000);
        }
      }
    };
  
    const nextTutorialStep = () => {
      if (tutorialStep < 2) {
        setTutorialStep(prev => prev + 1);
      } else {
        setShowTutorial(false);
      }
    };
  
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-center flex-grow">ColorChain</h1>
          <button 
            onClick={() => setShowTutorial(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            ?
          </button>
        </div>
  
        {showTutorial && (
          <TutorialStep 
            step={tutorialStep} 
            onClose={() => setShowTutorial(false)}
          />
        )}
        
        <div className="flex justify-center gap-2 mb-6">
          {gameState.sequence.map((color, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-lg transition-all duration-500"
              style={{
                backgroundColor: gameState.gameOver ? 
                  `rgb(${color.join(',')})` : 
                  'rgb(40, 40, 40)'
              }}
            />
          ))}
        </div>
  
        {!gameState.gameOver && gameState.currentRound < 5 && (
          <div className="flex justify-center gap-2 mb-4">
            {gameState.options[gameState.currentRound]?.map((color, i) => (
              <button
                key={i}
                className="w-12 h-12 rounded-lg hover:ring-2 hover:ring-blue-500 transition-all transform hover:scale-105"
                style={{ backgroundColor: `rgb(${color.join(',')})` }}
                onClick={() => handleColorSelect(i)}
              />
            ))}
          </div>
        )}
  
        <div className="space-y-2 mb-4">
          {gameState.guesses.map((guess, i) => (
            <div key={i} className="flex items-center justify-center gap-2">
              {guess !== null && (
                <>
                  <div 
                    className="w-12 h-12 rounded-lg"
                    style={{ 
                      backgroundColor: `rgb(${gameState.options[i][guess].join(',')})` 
                    }}
                  />
                  <span className={`text-2xl ${guess === 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {guess === 0 ? '✓' : '×'}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
  
        {gameState.gameOver && (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">
              {gameState.won ? "Congratulations! 🎉" : "Game Over"}
            </h2>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            >
              {copyFeedback || 'Share Results'}
            </button>
          </div>
        )}
  
        {showTutorial && (
          <button
            onClick={nextTutorialStep}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all w-full"
          >
            {tutorialStep < 2 ? "Next" : "Start Playing"}
          </button>
        )}
      </div>
    );
  };
  
  ReactDOM.render(<ColorChain />, document.getElementById('root'));