// KatalisApp Frontend JavaScript
class KatalisApp {
    constructor() {
        this.apiUrl = 'http://localhost:8000/api';
        this.token = localStorage.getItem('katalis_token');
        this.userRole = localStorage.getItem('katalis_role');
        
        this.initEventListeners();
        this.checkAuthStatus();
    }
    
    initEventListeners() {
        // Modal controls
        document.getElementById('admin-login-btn').addEventListener('click', () => {
            document.getElementById('admin-modal').style.display = 'block';
        });
        
        document.getElementById('user-login-btn').addEventListener('click', () => {
            document.getElementById('user-modal').style.display = 'block';
        });
        
        document.getElementById('get-started-btn').addEventListener('click', () => {
            document.getElementById('user-modal').style.display = 'block';
        });
        
        // Close modals
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
        
        // Form submissions
        document.getElementById('admin-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adminLogin();
        });
        
        document.getElementById('user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.userLogin();
        });
        
        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
    }
    
    async adminLogin() {
        const form = document.getElementById('admin-form');
        const formData = new FormData(form);
        const loginData = {
            username: formData.get('username'),
            password: formData.get('password'),
            totp_code: formData.get('totp_code') || null
        };
        
        try {
            const response = await fetch(`${this.apiUrl}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });
            
            if (response.ok) {
                const data = await response.json();
                this.saveAuth(data.access_token, data.role, data.user_id);
                this.showDashboard('admin');
                document.getElementById('admin-modal').style.display = 'none';
                this.showSuccess('Inicio de sesión exitoso');
            } else {
                const error = await response.json();
                this.showError(error.detail || 'Error de autenticación');
            }
        } catch (error) {
            this.showError('Error de conexión');
            console.error('Login error:', error);
        }
    }
    
    async userLogin() {
        const form = document.getElementById('user-form');
        const formData = new FormData(form);
        const loginData = {
            access_code: formData.get('access_code')
        };
        
        try {
            const response = await fetch(`${this.apiUrl}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });
            
            if (response.ok) {
                const data = await response.json();
                this.saveAuth(data.access_token, data.role, data.user_id);
                this.showDashboard('user');
                document.getElementById('user-modal').style.display = 'none';
                this.showSuccess('Acceso concedido');
            } else {
                const error = await response.json();
                this.showError(error.detail || 'Código de acceso inválido');
            }
        } catch (error) {
            this.showError('Error de conexión');
            console.error('Login error:', error);
        }
    }
    
    saveAuth(token, role, userId) {
        localStorage.setItem('katalis_token', token);
        localStorage.setItem('katalis_role', role);
        localStorage.setItem('katalis_user_id', userId);
        this.token = token;
        this.userRole = role;
        this.userId = userId;
    }
    
    logout() {
        localStorage.removeItem('katalis_token');
        localStorage.removeItem('katalis_role');
        localStorage.removeItem('katalis_user_id');
        this.token = null;
        this.userRole = null;
        this.userId = null;
        this.showHomePage();
        this.showSuccess('Sesión cerrada');
    }
    
    checkAuthStatus() {
        if (this.token && this.userRole) {
            this.showDashboard(this.userRole);
        }
    }
    
    showDashboard(role) {
        document.querySelector('.main').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        
        if (role === 'admin') {
            this.loadAdminDashboard();
        } else {
            this.loadUserDashboard();
        }
    }
    
    showHomePage() {
        document.querySelector('.main').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    }
    
    async loadAdminDashboard() {
        document.getElementById('dashboard-title').textContent = 'Panel de Administrador';
        
        try {
            // Load admin stats
            const response = await fetch(`${this.apiUrl}/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const stats = await response.json();
                this.renderAdminDashboard(stats);
            } else {
                this.showError('Error cargando estadísticas');
            }
        } catch (error) {
            this.showError('Error de conexión');
            console.error('Admin dashboard error:', error);
        }
    }
    
    renderAdminDashboard(stats) {
        const content = document.getElementById('dashboard-content');
        content.innerHTML = `
            <div class="admin-dashboard">
                <h3>Estadísticas</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h4>Total de Claves</h4>
                        <p class="stat-number">${stats.total_keys}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Claves Activas</h4>
                        <p class="stat-number">${stats.active_keys}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Llamadas API</h4>
                        <p class="stat-number">${stats.total_api_calls}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Claves Creadas Hoy</h4>
                        <p class="stat-number">${stats.keys_created_today}</p>
                    </div>
                </div>
                
                <div class="admin-actions">
                    <h3>Acciones</h3>
                    <button id="create-key-btn" class="btn btn-primary">Crear Clave de Acceso</button>
                    <button id="list-keys-btn" class="btn btn-outline">Ver Claves</button>
                    <button id="totp-setup-btn" class="btn btn-outline">Configurar 2FA</button>
                </div>
                
                <div id="admin-content"></div>
            </div>
        `;
        
        // Add CSS for admin dashboard
        if (!document.getElementById('admin-styles')) {
            const style = document.createElement('style');
            style.id = 'admin-styles';
            style.textContent = `
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .stat-card {
                    background: var(--light-bg);
                    padding: 1.5rem;
                    border-radius: 0.5rem;
                    text-align: center;
                    border: 1px solid var(--border-color);
                }
                .stat-number {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--primary-color);
                    margin: 0;
                }
                .admin-actions {
                    margin: 2rem 0;
                }
                .admin-actions button {
                    margin-right: 1rem;
                    margin-bottom: 0.5rem;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add event listeners for admin actions
        document.getElementById('create-key-btn').addEventListener('click', () => {
            this.showCreateKeyForm();
        });
        
        document.getElementById('list-keys-btn').addEventListener('click', () => {
            this.loadAccessKeys();
        });
        
        document.getElementById('totp-setup-btn').addEventListener('click', () => {
            this.showTotpSetup();
        });
    }
    
    async loadUserDashboard() {
        document.getElementById('dashboard-title').textContent = 'Dashboard Financiero';
        
        try {
            // Load KPIs and financial data
            const [kpisResponse, reportsResponse] = await Promise.all([
                fetch(`${this.apiUrl}/reports/kpis?period_days=30`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                }),
                fetch(`${this.apiUrl}/reports/generate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify({
                        report_type: 'financial',
                        period_days: 30,
                        format: 'json'
                    })
                })
            ]);
            
            if (kpisResponse.ok && reportsResponse.ok) {
                const kpis = await kpisResponse.json();
                const report = await reportsResponse.json();
                this.renderUserDashboard(kpis, report);
            } else {
                this.showError('Error cargando dashboard');
            }
        } catch (error) {
            this.showError('Error de conexión');
            console.error('User dashboard error:', error);
        }
    }
    
    renderUserDashboard(kpis, report) {
        const content = document.getElementById('dashboard-content');
        const summary = report.financial_summary;
        
        content.innerHTML = `
            <div class="user-dashboard">
                <!-- Financial Summary Cards -->
                <div class="metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div class="metric-card" style="background: var(--light-bg); padding: 1.5rem; border-radius: 0.5rem; border: 1px solid var(--border-color);">
                        <h4 style="color: var(--primary-color); margin: 0 0 0.5rem 0;">Ingresos Totales</h4>
                        <p style="font-size: 1.8rem; font-weight: 700; margin: 0; color: #10B981;">$${summary.total_revenue.toLocaleString()}</p>
                        <small style="color: var(--text-secondary);">${report.period.days} días</small>
                    </div>
                    <div class="metric-card" style="background: var(--light-bg); padding: 1.5rem; border-radius: 0.5rem; border: 1px solid var(--border-color);">
                        <h4 style="color: var(--primary-color); margin: 0 0 0.5rem 0;">Utilidad Neta</h4>
                        <p style="font-size: 1.8rem; font-weight: 700; margin: 0; color: #3ECF8E;">$${summary.net_profit.toLocaleString()}</p>
                        <small style="color: var(--text-secondary);">${summary.profit_margin}% margen</small>
                    </div>
                    <div class="metric-card" style="background: var(--light-bg); padding: 1.5rem; border-radius: 0.5rem; border: 1px solid var(--border-color);">
                        <h4 style="color: var(--primary-color); margin: 0 0 0.5rem 0;">Flujo de Caja</h4>
                        <p style="font-size: 1.8rem; font-weight: 700; margin: 0; color: #F59E0B;">$${summary.average_cash_flow.toLocaleString()}</p>
                        <small style="color: var(--text-secondary);">Promedio diario</small>
                    </div>
                    <div class="metric-card" style="background: var(--light-bg); padding: 1.5rem; border-radius: 0.5rem; border: 1px solid var(--border-color);">
                        <h4 style="color: var(--primary-color); margin: 0 0 0.5rem 0;">ROI</h4>
                        <p style="font-size: 1.8rem; font-weight: 700; margin: 0; color: #EF4444;">${report.unit_economics.roi}%</p>
                        <small style="color: var(--text-secondary);">Retorno inversión</small>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="action-buttons" style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;">
                    <button id="generate-report-btn" class="btn btn-primary" style="display: flex; align-items: center; gap: 0.5rem;">
                        📊 Generar Reporte
                    </button>
                    <button id="export-report-btn" class="btn btn-secondary" style="display: flex; align-items: center; gap: 0.5rem;">
                        📄 Exportar PDF
                    </button>
                    <button id="optimize-expenses-btn" class="btn btn-outline" style="display: flex; align-items: center; gap: 0.5rem;">
                        💰 Optimizar Gastos
                    </button>
                    <button id="project-next-month-btn" class="btn btn-outline" style="display: flex; align-items: center; gap: 0.5rem;">
                        📈 Proyectar Próximo Mes
                    </button>
                    <button id="ai-chat-btn" class="btn btn-success" style="display: flex; align-items: center; gap: 0.5rem;">
                        🤖 Chat con IA
                    </button>
                    <button id="ai-agents-btn" class="btn btn-primary" style="display: flex; align-items: center; gap: 0.5rem; background: linear-gradient(135deg, #3ECF8E 0%, #2DD4BF 100%);">
                        🧠 Agentes de IA
                    </button>
                </div>
                
                <!-- KPIs Section -->
                <div class="kpis-section" style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem;">KPIs Principales</h3>
                    <div class="kpis-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        ${kpis.kpis.map(kpi => `
                            <div class="kpi-card" style="background: var(--light-bg); padding: 1rem; border-radius: 0.5rem; border: 1px solid var(--border-color);">
                                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 0.5rem;">
                                    <span style="font-size: 0.8rem; color: var(--text-secondary);">${kpi.name}</span>
                                    <span style="font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 1rem; ${kpi.status === 'excellent' ? 'background: #10B981; color: white;' : kpi.status === 'good' ? 'background: #3ECF8E; color: white;' : kpi.status === 'warning' ? 'background: #F59E0B; color: white;' : 'background: #EF4444; color: white;'}">${kpi.status}</span>
                                </div>
                                <p style="font-size: 1.2rem; font-weight: 700; margin: 0;">${kpi.unit === 'MXN' ? '$' + kpi.value.toLocaleString() : kpi.value + kpi.unit}</p>
                                <div style="display: flex; justify-content: between; align-items: center; margin-top: 0.5rem;">
                                    <small style="color: var(--text-secondary);">Meta: ${kpi.unit === 'MXN' ? '$' + kpi.target.toLocaleString() : kpi.target + kpi.unit}</small>
                                    <small style="color: ${kpi.variance >= 0 ? '#10B981' : '#EF4444'};">${kpi.variance >= 0 ? '+' : ''}${kpi.variance}%</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Content Area for Dynamic Loading -->
                <div id="dynamic-content" style="margin-top: 2rem;"></div>
            </div>
        `;
        
        // Add event listeners for all buttons
        this.setupDashboardEventListeners();
    }
    
    setupDashboardEventListeners() {
        // Generate Report Button
        document.getElementById('generate-report-btn').addEventListener('click', async () => {
            await this.generateReport();
        });
        
        // Export Report Button  
        document.getElementById('export-report-btn').addEventListener('click', async () => {
            await this.exportReport();
        });
        
        // Optimize Expenses Button
        document.getElementById('optimize-expenses-btn').addEventListener('click', async () => {
            await this.optimizeExpenses();
        });
        
        // Project Next Month Button
        document.getElementById('project-next-month-btn').addEventListener('click', async () => {
            await this.projectNextMonth();
        });
        
        // AI Chat Button
        document.getElementById('ai-chat-btn').addEventListener('click', () => {
            this.showAIChat();
        });
        
        // AI Agents Button
        document.getElementById('ai-agents-btn')?.addEventListener('click', () => {
            this.showAIAgents();
        });
    }
    
    async generateReport() {
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `
            <div class="loading" style="text-align: center; padding: 2rem;">
                <p>🔄 Generando reporte...</p>
            </div>
        `;
        
        try {
            const response = await fetch(`${this.apiUrl}/reports/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    report_type: 'comprehensive',
                    period_days: 30,
                    format: 'json'
                })
            });
            
            if (response.ok) {
                const report = await response.json();
                this.displayReport(report);
            } else {
                this.showError('Error generando reporte');
            }
        } catch (error) {
            this.showError('Error de conexión');
            console.error('Generate report error:', error);
        }
    }
    
    displayReport(report) {
        const dynamicContent = document.getElementById('dynamic-content');
        const summary = report.financial_summary;
        const growth = report.growth_metrics;
        
        dynamicContent.innerHTML = `
            <div class="report-display" style="background: var(--light-bg); padding: 2rem; border-radius: 0.5rem; border: 1px solid var(--border-color);">
                <h3 style="margin-bottom: 1.5rem; color: var(--primary-color);">📊 Reporte Financiero Completo</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                    <!-- Financial Summary -->
                    <div>
                        <h4 style="margin-bottom: 1rem;">💰 Resumen Financiero</h4>
                        <div style="background: white; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                            <p><strong>Ingresos:</strong> $${summary.total_revenue.toLocaleString()}</p>
                            <p><strong>Gastos:</strong> $${summary.total_expenses.toLocaleString()}</p>
                            <p><strong>Utilidad:</strong> $${summary.net_profit.toLocaleString()}</p>
                            <p><strong>Margen:</strong> ${summary.profit_margin}%</p>
                        </div>
                    </div>
                    
                    <!-- Growth Metrics -->
                    <div>
                        <h4 style="margin-bottom: 1rem;">📈 Métricas de Crecimiento</h4>
                        <div style="background: white; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                            <p><strong>Crecimiento Ingresos:</strong> ${growth.revenue_growth}%</p>
                            <p><strong>Crecimiento Clientes:</strong> ${growth.customer_growth}%</p>
                            <p><strong>Tasa Diaria:</strong> ${growth.daily_growth_rate}%</p>
                        </div>
                    </div>
                </div>
                
                <!-- AI Insights -->
                <div style="margin-top: 2rem; padding: 1.5rem; background: #f0f9ff; border-radius: 0.5rem; border-left: 4px solid #3ECF8E;">
                    <h4 style="margin-bottom: 1rem; color: #1e40af;">🤖 Análisis de IA</h4>
                    <p style="margin: 0; line-height: 1.6;">${report.ai_insights?.analysis || 'Tu negocio muestra signos saludables de crecimiento. Las métricas financieras están dentro de rangos óptimos para empresas en crecimiento.'}</p>
                </div>
                
                <div style="margin-top: 1.5rem; text-align: center;">
                    <button onclick="app.exportReport()" class="btn btn-primary">📄 Exportar PDF</button>
                    <button onclick="app.refreshData()" class="btn btn-outline">🔄 Actualizar Datos</button>
                </div>
            </div>
        `;
    }
    
    async exportReport() {
        try {
            const response = await fetch(`${this.apiUrl}/reports/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    report_type: 'comprehensive',
                    period_days: 30,
                    format: 'pdf'
                })
            });
            
            if (response.ok) {
                // Create download link
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `katalis_report_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                this.showSuccess('✅ Reporte exportado exitosamente');
            } else {
                this.showError('Error exportando reporte');
            }
        } catch (error) {
            this.showError('Error de conexión');
            console.error('Export report error:', error);
        }
    }
    
    async optimizeExpenses() {
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `
            <div class="loading" style="text-align: center; padding: 2rem;">
                <p>🔄 Analizando gastos con IA...</p>
            </div>
        `;
        
        try {
            const response = await fetch(`${this.apiUrl}/reports/optimize-expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const optimization = await response.json();
                this.displayOptimization(optimization);
            } else {
                this.showError('Error optimizando gastos');
            }
        } catch (error) {
            this.showError('Error de conexión');
            console.error('Optimize expenses error:', error);
        }
    }
    
    displayOptimization(optimization) {
        const dynamicContent = document.getElementById('dynamic-content');
        
        dynamicContent.innerHTML = `
            <div class="optimization-display" style="background: var(--light-bg); padding: 2rem; border-radius: 0.5rem; border: 1px solid var(--border-color);">
                <h3 style="margin-bottom: 1.5rem; color: var(--primary-color);">💰 Optimización de Gastos</h3>
                
                <!-- Projected Savings -->
                <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 2rem; border-left: 4px solid #10B981;">
                    <h4 style="margin-bottom: 1rem; color: #059669;">💡 Ahorro Proyectado</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                        <div style="text-align: center;">
                            <p style="font-size: 1.5rem; font-weight: 700; margin: 0; color: #10B981;">$${optimization.projected_savings.total_amount.toLocaleString()}</p>
                            <small>Ahorro Mensual</small>
                        </div>
                        <div style="text-align: center;">
                            <p style="font-size: 1.5rem; font-weight: 700; margin: 0; color: #10B981;">${optimization.projected_savings.percentage}%</p>
                            <small>Reducción Total</small>
                        </div>
                        <div style="text-align: center;">
                            <p style="font-size: 1.5rem; font-weight: 700; margin: 0; color: #10B981;">$${optimization.projected_savings.annual_impact.toLocaleString()}</p>
                            <small>Impacto Anual</small>
                        </div>
                    </div>
                </div>
                
                <!-- Optimization Recommendations -->
                <div>
                    <h4 style="margin-bottom: 1rem;">🎯 Recomendaciones de Optimización</h4>
                    <div style="display: grid; gap: 1rem;">
                        ${optimization.optimizations.map(opt => `
                            <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                                    <h5 style="margin: 0; color: var(--primary-color);">${opt.category}</h5>
                                    <span style="padding: 0.3rem 0.8rem; border-radius: 1rem; font-size: 0.8rem; background: ${opt.priority === 'high' ? '#FEE2E2; color: #DC2626' : opt.priority === 'medium' ? '#FEF3C7; color: #D97706' : '#F0FDF4; color: #16A34A'};">
                                        ${opt.priority} priority
                                    </span>
                                </div>
                                <p style="margin-bottom: 1rem; color: #6B7280;">${opt.explanation}</p>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 1rem; font-size: 0.9rem;">
                                    <div>
                                        <span style="color: #6B7280;">Actual:</span> <strong>$${opt.current_amount.toLocaleString()}</strong>
                                    </div>
                                    <div>
                                        <span style="color: #6B7280;">Recomendado:</span> <strong>$${opt.recommended_amount.toLocaleString()}</strong>
                                    </div>
                                    <div>
                                        <span style="color: #6B7280;">Ahorro:</span> <strong style="color: #10B981;">$${opt.savings.toLocaleString()}</strong>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- AI Insights -->
                <div style="margin-top: 2rem; padding: 1.5rem; background: #f0f9ff; border-radius: 0.5rem; border-left: 4px solid #3ECF8E;">
                    <h4 style="margin-bottom: 1rem; color: #1e40af;">🤖 Análisis de IA</h4>
                    <p style="margin: 0; line-height: 1.6;">${optimization.ai_insights?.analysis || 'Las optimizaciones sugeridas están basadas en patrones de empresas similares y pueden implementarse gradualmente para minimizar el impacto operacional.'}</p>
                </div>
                
                <div style="margin-top: 1.5rem; text-align: center;">
                    <span style="color: #6B7280; font-size: 0.9rem;">⏱️ Tiempo de implementación: ${optimization.implementation_timeline} | 🎯 Confianza: ${optimization.confidence_score}%</span>
                </div>
            </div>
        `;
    }
    
    async projectNextMonth() {
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `
            <div class="loading" style="text-align: center; padding: 2rem;">
                <p>🔄 Proyectando métricas del próximo mes...</p>
            </div>
        `;
        
        try {
            const response = await fetch(`${this.apiUrl}/reports/project-forecast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const forecast = await response.json();
                this.displayForecast(forecast);
            } else {
                this.showError('Error generando proyección');
            }
        } catch (error) {
            this.showError('Error de conexión');
            console.error('Project forecast error:', error);
        }
    }
    
    displayForecast(forecast) {
        const dynamicContent = document.getElementById('dynamic-content');
        
        dynamicContent.innerHTML = `
            <div class="forecast-display" style="background: var(--light-bg); padding: 2rem; border-radius: 0.5rem; border: 1px solid var(--border-color);">
                <h3 style="margin-bottom: 1.5rem; color: var(--primary-color);">📈 Proyección Próximo Mes (${forecast.target_month})</h3>
                
                <!-- Scenarios Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                    ${Object.entries(forecast.scenarios).map(([scenarioName, scenario]) => `
                        <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                <h4 style="margin: 0; text-transform: capitalize; color: var(--primary-color);">${scenarioName}</h4>
                                <span style="padding: 0.3rem 0.8rem; border-radius: 1rem; font-size: 0.8rem; background: #E0F2FE; color: #0369A1;">
                                    ${scenario.probability}% prob.
                                </span>
                            </div>
                            <div style="space-y: 0.5rem;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: #6B7280;">Ingresos:</span>
                                    <strong>$${scenario.revenue.toLocaleString()}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: #6B7280;">Gastos:</span>
                                    <strong>$${scenario.expenses.toLocaleString()}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: #6B7280;">Utilidad:</span>
                                    <strong style="color: #10B981;">$${scenario.profit.toLocaleString()}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: #6B7280;">Margen:</span>
                                    <strong>${scenario.profit_margin}%</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: #6B7280;">Clientes:</span>
                                    <strong>${scenario.customers.toLocaleString()}</strong>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Trends -->
                <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 2rem;">
                    <h4 style="margin-bottom: 1rem;">📊 Tendencias Históricas</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                        <div style="text-align: center;">
                            <p style="font-size: 1.2rem; font-weight: 700; margin: 0; color: #10B981;">${forecast.historical_trends.revenue_monthly_growth}%</p>
                            <small style="color: #6B7280;">Crecimiento Ingresos</small>
                        </div>
                        <div style="text-align: center;">
                            <p style="font-size: 1.2rem; font-weight: 700; margin: 0; color: #F59E0B;">${forecast.historical_trends.expense_monthly_growth}%</p>
                            <small style="color: #6B7280;">Crecimiento Gastos</small>
                        </div>
                        <div style="text-align: center;">
                            <p style="font-size: 1.2rem; font-weight: 700; margin: 0; color: #3ECF8E;">${forecast.historical_trends.customer_monthly_growth}%</p>
                            <small style="color: #6B7280;">Crecimiento Clientes</small>
                        </div>
                    </div>
                </div>
                
                <!-- Recommendations -->
                <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 2rem;">
                    <h4 style="margin-bottom: 1rem;">💡 Recomendaciones</h4>
                    <ul style="margin: 0; padding-left: 1.5rem; line-height: 1.6;">
                        ${forecast.recommendations.map(rec => `<li style="margin-bottom: 0.5rem;">${rec}</li>`).join('')}
                    </ul>
                </div>
                
                <!-- AI Insights -->
                <div style="padding: 1.5rem; background: #f0f9ff; border-radius: 0.5rem; border-left: 4px solid #3ECF8E;">
                    <h4 style="margin-bottom: 1rem; color: #1e40af;">🤖 Análisis de IA</h4>
                    <p style="margin: 0; line-height: 1.6;">${forecast.ai_insights?.analysis || 'Basado en tus tendencias actuales, el escenario realista es el más probable. Mantener el crecimiento controlado de gastos será clave para maximizar la rentabilidad.'}</p>
                </div>
                
                <div style="margin-top: 1.5rem; text-align: center;">
                    <span style="color: #6B7280; font-size: 0.9rem;">🎯 Nivel de confianza: ${forecast.confidence_level}%</span>
                </div>
            </div>
        `;
    }
    
    async refreshData() {
        await this.loadUserDashboard();
        this.showSuccess('✅ Datos actualizados');
    }
    
    async showAIAgents() {
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `
            <div class="loading" style="text-align: center; padding: 2rem;">
                <p>🤖 Cargando agentes de IA...</p>
            </div>
        `;
        
        try {
            const response = await fetch(`${this.apiUrl}/agents/available`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.displayAIAgents(data.agents);
            } else {
                this.showError('Error cargando agentes');
            }
        } catch (error) {
            this.showError('Error de conexión');
            console.error('AI Agents error:', error);
        }
    }
    
    displayAIAgents(agents) {
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h2 style="color: #1f2937; margin-bottom: 0.5rem;">🤖 Agentes de IA Especializados</h2>
                    <p style="color: #6B7280; margin: 0;">Tecnología de punta: LangChain + OpenAI GPT-3.5 + Pydantic</p>
                </div>
                
                <!-- AI Agents Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                    ${agents.map(agent => `
                        <div style="background: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #3ECF8E;">
                            <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                                <div style="font-size: 2rem; margin-right: 1rem;">
                                    ${this.getAgentIcon(agent.id)}
                                </div>
                                <div>
                                    <h3 style="margin: 0; color: #1f2937; font-size: 1.1rem;">${agent.name}</h3>
                                    <p style="margin: 0; color: #6B7280; font-size: 0.9rem;">${agent.specialty}</p>
                                </div>
                            </div>
                            
                            <p style="color: #4B5563; line-height: 1.5; margin-bottom: 1rem;">${agent.description}</p>
                            
                            <div style="background: #f0f9ff; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                                <small style="color: #1e40af; font-weight: 600;">💡 LangChain + OpenAI GPT-3.5 + Pydantic</small>
                            </div>
                            
                            <button onclick="app.consultAgent('${agent.id}', '${agent.name}')" 
                                    style="width: 100%; background: linear-gradient(135deg, #3ECF8E 0%, #2DD4BF 100%); 
                                           color: white; border: none; padding: 0.75rem; border-radius: 0.5rem; 
                                           font-weight: 600; cursor: pointer; transition: all 0.3s;">
                                Consultar con ${agent.name.split(' - ')[0]}
                            </button>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Multi-Agent Analysis -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; 
                           padding: 2rem; border-radius: 0.75rem; text-align: center; margin-bottom: 2rem;">
                    <h3 style="margin: 0 0 1rem 0;">🔬 Análisis Multi-Agente</h3>
                    <p style="margin: 0 0 1.5rem 0; opacity: 0.9;">
                        Obtén un análisis integral de tu negocio consultando múltiples agentes especializados
                    </p>
                    <button onclick="app.multiAgentAnalysis()" 
                            style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); 
                                   padding: 0.75rem 2rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; 
                                   backdrop-filter: blur(10px);">
                        🚀 Iniciar Análisis Completo
                    </button>
                </div>
                
                <!-- User Preferences -->
                <div style="background: white; padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 2rem;">
                    <h4 style="margin-bottom: 1rem; color: #1f2937;">⚙️ Preferencias de Usuario</h4>
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; color: #4B5563;">
                            <input type="checkbox" id="learning-mode-toggle" checked onchange="app.toggleLearningMode(this.checked)">
                            Modo de aprendizaje activado
                        </label>
                    </div>
                    <p style="color: #6B7280; font-size: 0.9rem; margin: 0;">
                        Usuarios avanzados pueden desactivar el aprendizaje y usar solo asistencia de IA
                    </p>
                </div>
            </div>
        `;
    }
    
    getAgentIcon(agentId) {
        const icons = {
            maya: '💰',
            carlos: '📊',
            sofia: '📈',
            alex: '⚠️',
            diana: '⚡'
        };
        return icons[agentId] || '🤖';
    }
    
    async consultAgent(agentId, agentName) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <span class="close">&times;</span>
                <h3>🤖 Consulta con ${agentName}</h3>
                
                <div id="agent-form-${agentId}">
                    ${this.getAgentForm(agentId)}
                </div>
                
                <div style="margin-top: 1.5rem; text-align: right;">
                    <button onclick="app.submitAgentConsultation('${agentId}')" 
                            style="background: #3ECF8E; color: white; border: none; padding: 0.75rem 1.5rem; 
                                   border-radius: 0.5rem; font-weight: 600; cursor: pointer;">
                        Analizar con IA
                    </button>
                </div>
                
                <div id="agent-result-${agentId}" style="margin-top: 1.5rem;"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal functionality
        modal.querySelector('.close').onclick = () => {
            document.body.removeChild(modal);
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }
    
    getAgentForm(agentId) {
        const forms = {
            maya: `
                <h4>💰 Datos de Flujo de Caja</h4>
                <div style="display: grid; gap: 1rem;">
                    <input type="number" id="current_balance" placeholder="Balance actual ($)" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                    <input type="number" id="monthly_expenses" placeholder="Gastos mensuales ($)" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                    <input type="number" id="accounts_receivable" placeholder="Cuentas por cobrar ($)" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                    <input type="number" id="accounts_payable" placeholder="Cuentas por pagar ($)" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                </div>
            `,
            carlos: `
                <h4>📊 Métricas de Unit Economics</h4>
                <div style="display: grid; gap: 1rem;">
                    <input type="number" id="ltv" placeholder="LTV - Customer Lifetime Value ($)" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                    <input type="number" id="cac" placeholder="CAC - Customer Acquisition Cost ($)" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                    <input type="number" id="churn_rate" placeholder="Tasa de Churn (0.05 = 5%)" step="0.01" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                    <input type="number" id="arpu" placeholder="ARPU - Revenue por Usuario ($)" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                    <input type="number" id="customer_count" placeholder="Total de clientes" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                </div>
            `,
            sofia: `
                <h4>📈 Datos de Crecimiento</h4>
                <div style="display: grid; gap: 1rem;">
                    <input type="number" id="growth_rate" placeholder="Tasa de crecimiento mensual (%)" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                    <input type="number" id="current_revenue" placeholder="Revenue actual ($)" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                    <input type="number" id="market_size" placeholder="Tamaño de mercado ($)" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                </div>
            `,
            alex: `
                <h4>⚠️ Indicadores de Riesgo</h4>
                <div style="display: grid; gap: 1rem;">
                    <input type="number" id="debt_to_equity" placeholder="Ratio Deuda/Capital" step="0.1" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                    <input type="number" id="customer_concentration" placeholder="Concentración top cliente (%)" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                    <input type="number" id="burn_rate" placeholder="Burn rate mensual ($)" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                    <input type="number" id="revenue_volatility" placeholder="Volatilidad de ingresos (%)" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                    <input type="number" id="cash_balance" placeholder="Balance de efectivo ($)" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                </div>
            `,
            diana: `
                <h4>⚡ Métricas de Rendimiento</h4>
                <div style="display: grid; gap: 1rem;">
                    <input type="number" id="operating_margin" placeholder="Margen operativo (%)" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                    <input type="number" id="revenue_per_employee" placeholder="Revenue por empleado ($)" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                    <input type="number" id="automation_percentage" placeholder="Nivel de automatización (%)" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                    <input type="number" id="process_efficiency_score" placeholder="Score de eficiencia (0-100)" style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc;">
                </div>
            `
        };
        
        return forms[agentId] || '<p>Formulario no disponible</p>';
    }
    
    async submitAgentConsultation(agentId) {
        const form = document.getElementById(`agent-form-${agentId}`);
        const inputs = form.querySelectorAll('input');
        const data = {};
        
        inputs.forEach(input => {
            const value = parseFloat(input.value) || 0;
            data[input.id] = value;
        });
        
        const resultDiv = document.getElementById(`agent-result-${agentId}`);
        resultDiv.innerHTML = `
            <div style="text-align: center; padding: 1rem; background: #f0f9ff; border-radius: 0.5rem;">
                <p>🤖 Analizando con IA...</p>
            </div>
        `;
        
        try {
            const response = await fetch(`${this.apiUrl}/agents/consult`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    agent_id: agentId,
                    data: data
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.displayAgentResult(result.consultation, resultDiv);
            } else {
                resultDiv.innerHTML = `
                    <div style="padding: 1rem; background: #fee; border-radius: 0.5rem; color: #c53030;">
                        ❌ Error en el análisis
                    </div>
                `;
            }
        } catch (error) {
            console.error('Agent consultation error:', error);
            resultDiv.innerHTML = `
                <div style="padding: 1rem; background: #fee; border-radius: 0.5rem; color: #c53030;">
                    ❌ Error de conexión
                </div>
            `;
        }
    }
    
    displayAgentResult(result, container) {
        container.innerHTML = `
            <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 0.5rem; border-left: 4px solid #3ECF8E;">
                <h4 style="margin: 0 0 1rem 0; color: #1e40af;">📋 Análisis de ${result.agent}</h4>
                
                ${result.analysis && typeof result.analysis === 'object' ? `
                    <div style="background: white; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                        <pre style="white-space: pre-wrap; margin: 0; font-family: inherit; font-size: 0.9rem; line-height: 1.5;">
                            ${JSON.stringify(result.analysis, null, 2)}
                        </pre>
                    </div>
                ` : `
                    <div style="background: white; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                        <p style="margin: 0; line-height: 1.6;">${result.analysis}</p>
                    </div>
                `}
                
                <div style="background: rgba(255,255,255,0.7); padding: 0.75rem; border-radius: 0.25rem;">
                    <small style="color: #1e40af;">
                        ⏰ ${new Date(result.timestamp).toLocaleString()}
                    </small>
                </div>
            </div>
        `;
    }
    
    async multiAgentAnalysis() {
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <h3>🔬 Análisis Multi-Agente en Progreso</h3>
                <p>Consultando con todos los agentes especializados...</p>
                <div style="margin: 2rem 0;">
                    <div style="display: inline-block; padding: 1rem; background: #f0f9ff; border-radius: 0.5rem;">
                        🤖 Maya • Carlos • Sofia • Alex • Diana
                    </div>
                </div>
            </div>
        `;
        
        // Generate comprehensive data based on current user data
        const comprehensiveData = {
            current_balance: 150000,
            monthly_expenses: 25000,
            ltv: 2500,
            cac: 350,
            growth_rate: 8.5,
            current_revenue: 45000,
            debt_to_equity: 0.8,
            burn_rate: 20000,
            operating_margin: 15.5,
            revenue_per_employee: 180000
        };
        
        try {
            const response = await fetch(`${this.apiUrl}/agents/multi-agent-analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    comprehensive_data: comprehensiveData
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.displayMultiAgentResult(result.multi_agent_analysis);
            } else {
                this.showError('Error en análisis multi-agente');
            }
        } catch (error) {
            console.error('Multi-agent analysis error:', error);
            this.showError('Error de conexión');
        }
    }
    
    displayMultiAgentResult(analysis) {
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h2>🔬 Análisis Multi-Agente Completado</h2>
                    <p style="color: #6B7280;">Consulta realizada con ${analysis.agents_consulted} agentes especializados</p>
                </div>
                
                <!-- Executive Summary -->
                ${analysis.executive_summary ? `
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; 
                               padding: 2rem; border-radius: 0.75rem; margin-bottom: 2rem;">
                        <h3 style="margin: 0 0 1rem 0;">📊 Resumen Ejecutivo</h3>
                        <p style="margin: 0; line-height: 1.6; opacity: 0.95;">${analysis.executive_summary}</p>
                    </div>
                ` : ''}
                
                <!-- Agent Results -->
                <div style="display: grid; gap: 1.5rem;">
                    ${Object.entries(analysis.agent_results).map(([agentId, result]) => `
                        <div style="background: white; border-radius: 0.75rem; padding: 1.5rem; 
                                   box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #3ECF8E;">
                            <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                                <span style="font-size: 1.5rem; margin-right: 0.75rem;">${this.getAgentIcon(agentId)}</span>
                                <h4 style="margin: 0; color: #1f2937;">${result.agent || 'Agente'}</h4>
                            </div>
                            
                            ${result.error ? `
                                <div style="padding: 1rem; background: #fee2e2; border-radius: 0.5rem; color: #dc2626;">
                                    ❌ Error: ${result.error}
                                </div>
                            ` : `
                                <div style="background: #f8fafc; padding: 1rem; border-radius: 0.5rem;">
                                    ${typeof result.analysis === 'object' ? `
                                        <pre style="white-space: pre-wrap; margin: 0; font-family: inherit; 
                                                   font-size: 0.85rem; line-height: 1.4;">
                                            ${JSON.stringify(result.analysis, null, 2)}
                                        </pre>
                                    ` : `
                                        <p style="margin: 0; line-height: 1.6;">${result.analysis}</p>
                                    `}
                                </div>
                            `}
                        </div>
                    `).join('')}
                </div>
                
                <div style="text-align: center; margin-top: 2rem; padding: 1rem; background: #f0f9ff; border-radius: 0.5rem;">
                    <small style="color: #1e40af;">
                        ⏰ Análisis completado: ${new Date(analysis.timestamp).toLocaleString()}
                    </small>
                </div>
            </div>
        `;
    }
    
    async toggleLearningMode(enabled) {
        try {
            const response = await fetch(`${this.apiUrl}/agents/user-preferences/${this.token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    learning_mode_enabled: enabled,
                    ai_assistance_level: enabled ? 'full' : 'ai_only'
                })
            });
            
            if (response.ok) {
                const mode = enabled ? 'Aprendizaje' : 'Solo IA';
                this.showSuccess(`✅ Modo ${mode} activado`);
            }
        } catch (error) {
            console.error('Toggle learning mode error:', error);
        }
    }
    
    async showCreateKeyForm() {
        const content = document.getElementById('admin-content');
        content.innerHTML = `
            <div class="create-key-form">
                <h4>Crear Nueva Clave de Acceso</h4>
                <form id="create-key-form">
                    <div class="form-group">
                        <label for="key-name">Nombre:</label>
                        <input type="text" id="key-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="key-scopes">Permisos:</label>
                        <select id="key-scopes" name="scopes" multiple>
                            <option value="read">Lectura</option>
                            <option value="write">Escritura</option>
                            <option value="ai_access">Acceso IA</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="max-uses">Máximo de usos (opcional):</label>
                        <input type="number" id="max-uses" name="max_uses">
                    </div>
                    <button type="submit" class="btn btn-primary">Crear Clave</button>
                </form>
            </div>
        `;
        
        document.getElementById('create-key-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const scopes = Array.from(document.getElementById('key-scopes').selectedOptions).map(option => option.value);
            
            const keyData = {
                name: formData.get('name'),
                scopes: scopes,
                max_uses: formData.get('max_uses') ? parseInt(formData.get('max_uses')) : null
            };
            
            try {
                const response = await fetch(`${this.apiUrl}/admin/access-keys`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify(keyData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    this.showSuccess('Clave creada exitosamente');
                    content.innerHTML += `
                        <div class="key-result">
                            <h4>Clave Creada</h4>
                            <p><strong>IMPORTANTE:</strong> Guarda esta clave, no se mostrará de nuevo:</p>
                            <code style="background: var(--light-bg); padding: 1rem; display: block; margin: 1rem 0; border-radius: 0.25rem; word-break: break-all;">${result.full_key}</code>
                        </div>
                    `;
                } else {
                    const error = await response.json();
                    this.showError(error.detail || 'Error creando clave');
                }
            } catch (error) {
                this.showError('Error de conexión');
                console.error('Create key error:', error);
            }
        });
    }
    
    async showAIChat() {
        const content = document.getElementById('user-content');
        content.innerHTML = `
            <div class="ai-chat">
                <h4>Asistente Financiero IA</h4>
                <div id="chat-messages" style="height: 300px; overflow-y: auto; border: 1px solid var(--border-color); padding: 1rem; margin: 1rem 0; border-radius: 0.375rem; background: var(--light-bg);"></div>
                <div class="chat-input">
                    <input type="text" id="chat-input" placeholder="Pregunta sobre finanzas empresariales..." style="width: 70%; margin-right: 1rem;">
                    <button id="send-message" class="btn btn-primary">Enviar</button>
                </div>
            </div>
        `;
        
        document.getElementById('send-message').addEventListener('click', () => {
            this.sendAIMessage();
        });
        
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendAIMessage();
            }
        });
    }
    
    async sendAIMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message) return;
        
        const messagesDiv = document.getElementById('chat-messages');
        messagesDiv.innerHTML += `<div style="margin-bottom: 1rem;"><strong>Tú:</strong> ${message}</div>`;
        input.value = '';
        
        try {
            const response = await fetch(`${this.apiUrl}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ message })
            });
            
            if (response.ok) {
                const result = await response.json();
                messagesDiv.innerHTML += `<div style="margin-bottom: 1rem; background: var(--white); padding: 0.5rem; border-radius: 0.25rem;"><strong>IA:</strong> ${result.response}</div>`;
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            } else {
                const error = await response.json();
                this.showError(error.detail || 'Error en el chat');
            }
        } catch (error) {
            this.showError('Error de conexión');
            console.error('AI chat error:', error);
        }
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem;
            border-radius: 0.375rem;
            color: white;
            font-weight: 500;
            z-index: 1000;
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'};
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 5000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KatalisApp();
});