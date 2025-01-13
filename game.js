// ... [keeping the generateColorVariations function the same] ...

const SocialShare = ({ shareText }) => {
    const encodedText = encodeURIComponent(shareText);
    const currentUrl = encodeURIComponent(window.location.href);
    
    return (
      <div className="flex gap-2 justify-center mt-4">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-all"
        >
          Twitter
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}&quote=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          Facebook
        </a>
      </div>
    );
  };
  
  const GameStats = ({ guesses, won }) => {
    const correctGuesses = guesses.filter(guess => guess === 0).length;
    const accuracy = ((correctGuesses / guesses.filter(guess => guess !== null).length) * 100).toFixed(1);
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg shadow-inner mt-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-500">{correctGuesses}/5</div>
            <div className="text-sm text-gray-600">Correct</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-500">{accuracy}%</div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
        </div>
      </div>
    );
  };
  
  const ColorChain = () => {
    // ... [previous state declarations] ...
    const [showConfetti, setShowConfetti] = React.useState(false);
  
    const initGame = () => {
      const sequence = Array(5).fill(0).map(() => [
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255)
      ]);
      
      const options = sequence.map(color => generateColorVariations(color));
      
      setGameState({
        sequence,
        options,
        guesses: Array(5).fill(null),
        currentRound: 0,
        gameOver: false,
        won: false
      });
      setShowConfetti(false);
    };
  
    React.useEffect(() => {
      initGame();
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
        const hasWon = newGuesses.every(guess => guess === 0);
        newState.won = hasWon;
        if (hasWon) {
          setShowConfetti(true);
        }
        localStorage.setItem('colorchain_played', 'true');
      }
  
      setGameState(newState);
    };
  
    // ... [previous handleShare and nextTutorialStep functions] ...
  
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center flex-grow bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            ColorChain
          </h1>
          <button 
            onClick={() => setShowTutorial(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-lg"
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
        
        <div className="flex justify-center gap-3 mb-8">
          {gameState.sequence.map((color, i) => (
            <div
              key={i}
              className="w-14 h-14 rounded-lg shadow-md transition-all duration-500 reveal"
              style={{
                backgroundColor: gameState.gameOver ? 
                  `rgb(${color.join(',')})` : 
                  'rgb(40, 40, 40)',
                transformStyle: 'preserve-3d'
              }}
            />
          ))}
        </div>
  
        {!gameState.gameOver && gameState.currentRound < 5 && (
          <div className="flex justify-center gap-3 mb-6">
            {gameState.options[gameState.currentRound]?.map((color, i) => (
              <button
                key={i}
                className="w-14 h-14 rounded-lg shadow-lg color-option pulse"
                style={{ backgroundColor: `rgb(${color.join(',')})` }}
                onClick={() => handleColorSelect(i)}
              />
            ))}
          </div>
        )}
  
        <div className="space-y-3 mb-6">
          {gameState.guesses.map((guess, i) => (
            <div key={i} className="flex items-center justify-center gap-3">
              {guess !== null && (
                <>
                  <div 
                    className={`w-14 h-14 rounded-lg shadow-md pop-in`}
                    style={{ 
                      backgroundColor: `rgb(${gameState.options[i][guess].join(',')})` 
                    }}
                  />
                  <span className={`text-2xl ${
                    guess === 0 ? 'text-green-500 bounce' : 'text-red-500 shake'
                  }`}>
                    {guess === 0 ? '✓' : '×'}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
  
        {gameState.gameOver && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 pop-in">
              {gameState.won ? "Congratulations! 🎉" : "Game Over"}
            </h2>
            
            <GameStats guesses={gameState.guesses} won={gameState.won} />
            
            <div className="mt-6 space-y-4">
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all w-full"
              >
                {copyFeedback || 'Share Results'}
              </button>
              
              <button
                onClick={initGame}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all w-full"
              >
                Play Again
              </button>
            </div>
  
            <SocialShare 
              shareText={`ColorChain ${new Date().toLocaleDateString()}\n${
                gameState.guesses.map(guess => 
                  guess === 0 ? "🟢" : guess === null ? "⚪" : "🔴"
                ).join("")
              }`}
            />
          </div>
        )}
  
        {showTutorial && (
          <button
            onClick={nextTutorialStep}
            className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all w-full"
          >
            {tutorialStep < 2 ? "Next" : "Start Playing"}
          </button>
        )}
        
        {showConfetti && gameState.won && (
          <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
            {/* Simple CSS confetti effect */}
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-blue-500 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `fall ${1 + Math.random() * 2}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };
  
  ReactDOM.render(<ColorChain />, document.getElementById('root'));