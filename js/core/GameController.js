import { EventBus } from './EventBus.js';
import { StateMachine } from './StateMachine.js';
import { AudioEngine } from '../audio/AudioEngine.js';
import { BeatDetector } from '../audio/BeatDetector.js';
import { BeatProvider } from '../audio/BeatProvider.js';
import { BeatEngine } from '../gameplay/BeatEngine.js';
import { TimingEngine } from '../gameplay/TimingEngine.js';
import { PatternGenerator } from '../gameplay/PatternGenerator.js';
import { ArrowEngine } from '../gameplay/ArrowEngine.js';
import { JudgeEngine } from '../gameplay/JudgeEngine.js';
import { AIPlayer } from '../ai/AIPlayer.js';
import { GameConstants } from '../constants/GameConstants.js';

export class GameController {
    constructor() {
        this.eventBus = new EventBus();
        this.stateMachine = new StateMachine();
        this.audioEngine = new AudioEngine(this.eventBus);
        this.beatDetector = new BeatDetector();
        this.beatProvider = null;
        this.beatEngine = new BeatEngine();
        this.timingEngine = new TimingEngine();
        this.patternGenerator = new PatternGenerator();
        this.arrowEngine = new ArrowEngine();
        this.judgeEngine = new JudgeEngine();
        this.aiPlayer = new AIPlayer(this.arrowEngine, this.timingEngine);
        
        this.isPlaying = false;
        this.isPaused = false;
        this.animationFrameId = null;
        this.lastTime = 0;
        
        this.uiElements = {};
        this.setupUIElements();
        this.attachEventListeners();
        
        this.eventBus.subscribe('SONG_LOADED', this.handleSongLoaded.bind(this));
        this.eventBus.subscribe('BEAT_ANALYSIS_COMPLETE', this.handleBeatAnalysisComplete.bind(this));
        this.eventBus.subscribe('PLAYBACK_UPDATE', this.handlePlaybackUpdate.bind(this));
    }
    
    setupUIElements() {
        this.uiElements = {
            songFileInput: document.getElementById('song-file-input'),
            loadSongBtn: null, // No separate load button, using file input directly
            startGameBtn: document.getElementById('start-game-btn'),
            pauseBtn: document.getElementById('pause-resume-btn'),
            aiToggle: document.getElementById('ai-player-toggle'),
            bpmDetected: document.getElementById('detected-bpm'),
            bpmManual: document.getElementById('manual-bpm-input'),
            applyBpmBtn: document.getElementById('apply-bpm-btn'),
            resetBpmBtn: document.getElementById('reset-bpm-btn'),
            bpmCorrectionSection: document.getElementById('bpm-correction'),
            songNameDisplay: document.getElementById('song-name-display'),
            bpmDisplay: document.getElementById('hud-bpm'),
            beatDisplay: document.getElementById('hud-beat'),
            scoreDisplay: document.getElementById('score-display'),
            comboDisplay: document.getElementById('combo-display'),
            accuracyDisplay: document.getElementById('accuracy-display'),
            judgeText: document.getElementById('judge-display'),
            debugPanel: document.getElementById('debug-panel'),
            gaugeContainer: document.getElementById('beat-gauge-container'),
            gaugeBall: document.getElementById('gauge-ball'),
            arrowPanel: document.getElementById('arrow-panel'),
            gameArea: document.getElementById('gameplay-area')
        };
    }
    
    attachEventListeners() {
        // File input change listener
        this.uiElements.songFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadSong(file);
            }
        });
        
        this.uiElements.startGameBtn.addEventListener('click', () => {
            this.toggleGame();
        });
        
        this.uiElements.pauseBtn.addEventListener('click', () => {
            this.togglePause();
        });
        
        this.uiElements.aiToggle.addEventListener('change', (e) => {
            this.aiPlayer.setEnabled(e.target.checked);
        });
        
        this.uiElements.applyBpmBtn.addEventListener('click', () => {
            this.applyManualBPM();
        });
        
        this.uiElements.resetBpmBtn.addEventListener('click', () => {
            this.resetBPM();
        });
        
        this.uiElements.bpmManual.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.applyManualBPM();
            }
        });
        
        window.addEventListener('keydown', (e) => {
            if (this.stateMachine.getState() !== 'PLAYING') return;
            
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
                this.handleArrowInput(e.key);
            } else if (e.key === ' ') {
                e.preventDefault();
                this.handleSpaceInput();
            }
        });
    }
    
    async loadSong(file) {
        this.showLoading(true);
        this.uiElements.songNameDisplay.textContent = file.name;
        
        try {
            await this.audioEngine.loadFile(file);
        } catch (error) {
            console.error('Error loading song:', error);
            alert('Failed to load audio file: ' + error.message);
            this.showLoading(false);
        }
    }
    
    async handleSongLoaded() {
        this.showLoading(true);
        this.uiElements.bpmCorrectionSection.style.display = 'none';
        
        try {
            const audioBuffer = this.audioEngine.getAudioBuffer();
            const analysisResult = await this.beatDetector.analyze(audioBuffer);
            
            this.eventBus.publish('BEAT_ANALYSIS_COMPLETE', analysisResult);
        } catch (error) {
            console.error('Beat detection failed:', error);
            alert('Beat detection failed: ' + error.message);
            this.showLoading(false);
        }
    }
    
    handleBeatAnalysisComplete(data) {
        this.beatProvider = new BeatProvider(data.beats, data.bpm);
        this.beatEngine.setBeatProvider(this.beatProvider);
        this.timingEngine.setBeatEngine(this.beatEngine);
        this.timingEngine.setAudioEngine(this.audioEngine);
        
        this.uiElements.bpmDetected.textContent = data.bpm.toFixed(2);
        this.uiElements.bpmManual.value = Math.round(data.bpm);
        this.uiElements.bpmCorrectionSection.style.display = 'block';
        this.uiElements.bpmDisplay.textContent = data.bpm.toFixed(1);
        
        this.showLoading(false);
        this.uiElements.startGameBtn.disabled = false;
    }
    
    toggleGame() {
        if (this.isPlaying) {
            this.stopGame();
        } else {
            this.startGame();
        }
    }
    
    startGame() {
        if (!this.beatProvider) {
            alert('Please load a song first');
            return;
        }
        
        this.isPlaying = true;
        this.isPaused = false;
        this.stateMachine.setState('PLAYING');
        
        this.arrowEngine.reset();
        this.judgeEngine.reset();
        this.patternGenerator.reset();
        
        this.audioEngine.play();
        this.uiElements.startGameBtn.textContent = 'Stop Game';
        this.uiElements.pauseBtn.disabled = false;
        
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    stopGame() {
        this.isPlaying = false;
        this.isPaused = false;
        this.stateMachine.setState('IDLE');
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        this.audioEngine.stop();
        this.uiElements.startGameBtn.textContent = 'Start Game';
        this.uiElements.pauseBtn.disabled = true;
        
        this.updateHUD();
        this.updateDebugPanel();
    }
    
    togglePause() {
        if (!this.isPlaying) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.audioEngine.pause();
            this.uiElements.pauseBtn.textContent = 'Resume';
            this.stateMachine.setState('PAUSED');
        } else {
            this.audioEngine.play();
            this.uiElements.pauseBtn.textContent = 'Pause';
            this.stateMachine.setState('PLAYING');
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }
    
    gameLoop(currentTime = performance.now()) {
        if (!this.isPlaying || this.isPaused) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.timingEngine.update();
        
        const timingData = this.timingEngine.getTimingData();
        this.updateGauge(timingData.gaugeProgress);
        this.updateDebugPanel(timingData);
        
        if (this.aiPlayer.isEnabled()) {
            this.aiPlayer.update(timingData);
        }
        
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    handleArrowInput(key) {
        const arrowMap = {
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'ArrowUp': 'up',
            'ArrowDown': 'down'
        };
        
        const direction = arrowMap[key];
        if (!direction) return;
        
        const result = this.arrowEngine.input(direction);
        
        if (result.success) {
            this.renderArrowPanel();
        } else if (result.reset) {
            this.arrowEngine.reset();
            this.renderArrowPanel();
            this.showJudgeText('MISS', 'miss');
            this.judgeEngine.miss();
        }
        
        this.updateHUD();
    }
    
    handleSpaceInput() {
        if (!this.arrowEngine.isSequenceComplete()) return;
        
        const timingData = this.timingEngine.getTimingData();
        const judgeResult = this.judgeEngine.judge(timingData.gaugeProgress);
        
        if (judgeResult.judgment !== 'MISS') {
            this.arrowEngine.reset();
            this.renderArrowPanel();
            this.showJudgeText(judgeResult.judgment, judgeResult.judgment.toLowerCase());
            
            const pattern = this.patternGenerator.generate();
            this.arrowEngine.setPattern(pattern);
            this.renderArrowPanel();
        } else {
            this.showJudgeText('MISS', 'miss');
        }
        
        this.judgeEngine.addScore(judgeResult);
        this.updateHUD();
    }
    
    renderArrowPanel() {
        const currentPattern = this.arrowEngine.getCurrentPattern();
        const inputProgress = this.arrowEngine.getInputProgress();
        
        let html = '<div class="pattern-display">';
        
        for (let i = 0; i < currentPattern.length; i++) {
            const arrow = currentPattern[i];
            const isCompleted = i < inputProgress;
            const isCurrent = i === inputProgress;
            
            html += `<div class="arrow-icon ${arrow} ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">`;
            html += this.getArrowSymbol(arrow);
            html += '</div>';
        }
        
        html += '</div>';
        this.uiElements.arrowPanel.innerHTML = html;
    }
    
    getArrowSymbol(direction) {
        const symbols = {
            'left': '←',
            'right': '→',
            'up': '↑',
            'down': '↓'
        };
        return symbols[direction] || '';
    }
    
    updateGauge(progress) {
        if (!this.uiElements.gaugeBall) return;
        this.uiElements.gaugeBall.style.left = `${progress * 100}%`;
    }
    
    updateHUD() {
        const scoreData = this.judgeEngine.getScoreData();
        
        this.uiElements.scoreDisplay.textContent = scoreData.score.toString().padStart(6, '0');
        this.uiElements.comboDisplay.textContent = `Combo: ${scoreData.combo}`;
        this.uiElements.accuracyDisplay.textContent = `Accuracy: ${scoreData.accuracy.toFixed(2)}%`;
    }
    
    showJudgeText(text, className) {
        this.uiElements.judgeText.textContent = text;
        this.uiElements.judgeText.className = `judge-text ${className}`;
        
        setTimeout(() => {
            if (this.uiElements.judgeText.textContent === text) {
                this.uiElements.judgeText.textContent = '';
                this.uiElements.judgeText.className = 'judge-text';
            }
        }, 500);
    }
    
    updateDebugPanel(timingData = null) {
        if (!timingData) {
            timingData = this.timingEngine.getTimingData();
        }
        
        const data = {
            playbackTime: this.audioEngine.getCurrentTime().toFixed(3),
            bpm: this.beatEngine.getEffectiveBPM().toFixed(2),
            currentBeat: timingData.currentBeat,
            currentMeasure: timingData.currentMeasure,
            gaugeProgress: (timingData.gaugeProgress * 100).toFixed(2) + '%',
            beatCount: this.beatEngine.getBeatCount(),
            gameState: this.stateMachine.getState(),
            patternLength: this.arrowEngine.getCurrentPattern().length,
            inputProgress: this.arrowEngine.getInputProgress()
        };
        
        let html = '<div class="debug-row"><span>Time:</span><span>' + data.playbackTime + 's</span></div>';
        html += '<div class="debug-row"><span>BPM:</span><span>' + data.bpm + '</span></div>';
        html += '<div class="debug-row"><span>Beat:</span><span>' + data.currentBeat + '</span></div>';
        html += '<div class="debug-row"><span>Measure:</span><span>' + data.currentMeasure + '</span></div>';
        html += '<div class="debug-row"><span>Gauge:</span><span>' + data.gaugeProgress + '</span></div>';
        html += '<div class="debug-row"><span>State:</span><span>' + data.gameState + '</span></div>';
        html += '<div class="debug-row"><span>Pattern:</span><span>' + data.patternLength + ' arrows</span></div>';
        html += '<div class="debug-row"><span>Input:</span><span>' + data.inputProgress + '/' + data.patternLength + '</span></div>';
        
        this.uiElements.debugPanel.innerHTML = html;
    }
    
    applyManualBPM() {
        const manualBpm = parseFloat(this.uiElements.bpmManual.value);
        
        if (isNaN(manualBpm) || manualBpm < 40 || manualBpm > 300) {
            alert('Please enter a valid BPM (40-300)');
            return;
        }
        
        const wasPlaying = this.isPlaying && !this.isPaused;
        
        if (wasPlaying) {
            this.audioEngine.pause();
        }
        
        this.beatEngine.enableManualBPM(manualBpm);
        this.uiElements.bpmDisplay.textContent = manualBpm.toFixed(1) + ' (manual)';
        
        if (wasPlaying) {
            setTimeout(() => {
                this.audioEngine.play();
            }, 100);
        }
    }
    
    resetBPM() {
        const detectedBpm = this.beatEngine.getDetectedBPM();
        
        const wasPlaying = this.isPlaying && !this.isPaused;
        
        if (wasPlaying) {
            this.audioEngine.pause();
        }
        
        this.beatEngine.disableManualBPM();
        this.uiElements.bpmManual.value = Math.round(detectedBpm);
        this.uiElements.bpmDisplay.textContent = detectedBpm.toFixed(1);
        
        if (wasPlaying) {
            setTimeout(() => {
                this.audioEngine.play();
            }, 100);
        }
    }
    
    showLoading(show) {
        const indicator = document.getElementById('loading-indicator');
        const progress = document.getElementById('analysis-progress');
        const startBtn = this.uiElements.startGameBtn;
        
        if (show) {
            indicator.classList.remove('hidden');
            progress.classList.remove('hidden');
            startBtn.disabled = true;
        } else {
            indicator.classList.add('hidden');
            progress.classList.add('hidden');
        }
    }
}
