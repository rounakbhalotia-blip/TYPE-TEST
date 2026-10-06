/**
 * TypePulse - Canvas Performance Chart Engine
 * Renders smooth second-by-second WPM and error progression curves with tooltips.
 */

class PerformanceChart {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
    this.data = []; // { second, wpm, rawWpm, errors }
    this.hoverIndex = -1;
    this.initEvents();
  }

  setCanvas(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
    this.initEvents();
  }

  setData(data) {
    this.data = data || [];
    this.render();
  }

  initEvents() {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      this.handleHover(mouseX);
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverIndex = -1;
      this.render();
    });

    // Touch events for mobile/tablet sliding inspection
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        const rect = this.canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        this.handleHover(touchX);
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        const rect = this.canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        this.handleHover(touchX);
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      this.hoverIndex = -1;
      this.render();
    });

    window.addEventListener('resize', () => {
      if (this.data && this.data.length > 0) {
        this.render();
      }
    });
  }

  handleHover(mouseX) {
    if (!this.data || this.data.length < 2) return;
    const clientWidth = this.canvas.clientWidth || 700;
    const isMobile = clientWidth < 520;
    const padding = isMobile ? { top: 22, right: 15, bottom: 30, left: 32 } : { top: 30, right: 35, bottom: 40, left: 45 };
    const chartWidth = clientWidth - padding.left - padding.right;

    const relativeX = mouseX - padding.left;
    if (relativeX < 0 || relativeX > chartWidth) {
      this.hoverIndex = -1;
    } else {
      const step = chartWidth / (this.data.length - 1);
      this.hoverIndex = Math.min(this.data.length - 1, Math.max(0, Math.round(relativeX / step)));
    }
    this.render();
  }

  render() {
    if (!this.canvas || !this.ctx || !this.data || this.data.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const clientWidth = this.canvas.clientWidth || 700;
    const clientHeight = this.canvas.clientHeight || 240;

    this.canvas.width = clientWidth * dpr;
    this.canvas.height = clientHeight * dpr;
    this.ctx.resetTransform?.();
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const ctx = this.ctx;
    ctx.clearRect(0, 0, clientWidth, clientHeight);

    const isMobile = clientWidth < 520;
    const padding = isMobile ? { top: 22, right: 15, bottom: 30, left: 32 } : { top: 30, right: 35, bottom: 40, left: 45 };
    const width = clientWidth - padding.left - padding.right;
    const height = clientHeight - padding.top - padding.bottom;

    if (this.data.length < 2) {
      ctx.fillStyle = '#888';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Test too short for performance timeline graph', clientWidth / 2, clientHeight / 2);
      return;
    }

    // Determine max values
    let maxWpm = Math.max(...this.data.map(d => Math.max(d.wpm, d.rawWpm, 10)));
    maxWpm = Math.ceil((maxWpm + 10) / 20) * 20; // round up to multiple of 20
    const maxErrors = Math.max(1, ...this.data.map(d => d.errors || 0));

    // Get current theme accent colors from CSS
    const rootStyles = getComputedStyle(document.documentElement);
    const accentColor = rootStyles.getPropertyValue('--accent').trim() || '#e2b714';
    const textDim = rootStyles.getPropertyValue('--text-dim').trim() || '#646669';
    const errorColor = rootStyles.getPropertyValue('--error-color').trim() || '#ca4754';
    const bgPrimary = rootStyles.getPropertyValue('--bg-secondary').trim() || '#2c2e31';

    // Draw horizontal grid lines
    const gridLines = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = textDim;
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridLines; i++) {
      const yVal = Math.round((maxWpm / gridLines) * i);
      const yPos = padding.top + height - (height * (yVal / maxWpm));

      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(padding.left + width, yPos);
      ctx.stroke();

      ctx.fillText(yVal.toString(), padding.left - 8, yPos + 4);
    }

    // Draw X-axis time points
    ctx.textAlign = 'center';
    const stepCount = Math.min(8, this.data.length);
    for (let i = 0; i < stepCount; i++) {
      const idx = Math.floor((i / (stepCount - 1)) * (this.data.length - 1));
      const pt = this.data[idx];
      const xPos = padding.left + (idx / (this.data.length - 1)) * width;
      ctx.fillText(`${pt.second}s`, xPos, clientHeight - 15);
    }

    // Helper functions for coordinates
    const getX = (index) => padding.left + (index / (this.data.length - 1)) * width;
    const getY = (val) => padding.top + height - (height * (val / maxWpm));

    // 1. Draw Raw WPM Line (Dashed)
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    this.data.forEach((d, i) => {
      const x = getX(i);
      const y = getY(d.rawWpm);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();

    // 2. Draw Net WPM Curve with Gradient Area Fill
    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + height);
    grad.addColorStop(0, `${accentColor}33`); // 20% alpha
    grad.addColorStop(1, `${accentColor}00`);

    ctx.beginPath();
    this.data.forEach((d, i) => {
      const x = getX(i);
      const y = getY(d.wpm);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    // Close area for fill
    ctx.lineTo(getX(this.data.length - 1), padding.top + height);
    ctx.lineTo(getX(0), padding.top + height);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Stroke the Net WPM line
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    this.data.forEach((d, i) => {
      const x = getX(i);
      const y = getY(d.wpm);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 3. Draw Error Marks
    this.data.forEach((d, i) => {
      if (d.errors > 0) {
        const x = getX(i);
        const y = padding.top + height - 8;
        ctx.fillStyle = errorColor;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Cross or count
        ctx.font = 'bold 9px monospace';
        ctx.fillText(d.errors, x, y - 8);
      }
    });

    // 4. Hover Indicator and Tooltip
    if (this.hoverIndex >= 0 && this.hoverIndex < this.data.length) {
      const d = this.data[this.hoverIndex];
      const x = getX(this.hoverIndex);
      const y = getY(d.wpm);

      // Vertical line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + height);
      ctx.stroke();

      // Dot on WPM
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tooltip Card
      const ttWidth = 120;
      const ttHeight = 65;
      let ttX = x + 15;
      if (ttX + ttWidth > clientWidth - 10) ttX = x - ttWidth - 15;
      const ttY = Math.max(10, Math.min(padding.top + height - ttHeight, y - ttHeight / 2));

      ctx.fillStyle = bgPrimary;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(ttX, ttY, ttWidth, ttHeight, 6) : ctx.rect(ttX, ttY, ttWidth, ttHeight);
      ctx.fill();
      ctx.stroke();

      // Text inside tooltip
      ctx.textAlign = 'left';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText(`${d.second}s`, ttX + 10, ttY + 16);

      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillStyle = accentColor;
      ctx.fillText(`WPM: ${d.wpm}`, ttX + 10, ttY + 32);

      ctx.fillStyle = '#9ca3af';
      ctx.fillText(`Raw: ${d.rawWpm}`, ttX + 10, ttY + 46);

      if (d.errors > 0) {
        ctx.fillStyle = errorColor;
        ctx.fillText(`Errors: ${d.errors}`, ttX + 10, ttY + 59);
      }
    }
  }
}
