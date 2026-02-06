
export class DatajudService {
  private static API_KEY = 'APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
  private static BASE_URL = 'https://api-publica.datajud.cnj.jus.br';

  private static TR_TO_STATE_ALIAS: Record<string, string> = {
    '01': 'tjac', '02': 'tjal', '03': 'tjap', '04': 'tjam', '05': 'tjba',
    '06': 'tjce', '07': 'tjdf', '08': 'tjes', '09': 'tjgo', '10': 'tjma',
    '11': 'tjmt', '12': 'tjms', '13': 'tjmg', '14': 'tjpa', '15': 'tjpb',
    '16': 'tjpr', '17': 'tjpe', '18': 'tjpi', '19': 'tjrj', '20': 'tjrn',
    '21': 'tjrs', '22': 'tjro', '23': 'tjrr', '24': 'tjsc', '25': 'tjse',
    '26': 'tjsp', '27': 'tjto'
  };

  /**
   * Determina o alias do tribunal (api_publica_alias) baseado no número CNJ
   * Formato CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
   */
  private static getTribunalAlias(cnjRaw: string): string | null {
    // Remove caracteres não numéricos
    const cnj = cnjRaw.replace(/\D/g, '');
    
    if (cnj.length < 20) return null;

    // Extrair componentes
    // NNNNNNN (7) DD (2) AAAA (4) J (1) TR (2) OOOO (4)
    // 0123456     78     9012     3     45     6789
    
    // Posições baseadas em 0 (tamanho 20)
    // J está no índice 13
    // TR está nos índices 14, 15
    
    const j = cnj.substring(13, 14);
    const tr = cnj.substring(14, 16);

    // Justiça Federal (J=4)
    if (j === '4') {
      return `trf${parseInt(tr)}`; // trf1, trf2...
    }

    // Justiça do Trabalho (J=5)
    if (j === '5') {
      return `trt${parseInt(tr)}`; // trt1... trt24
    }

    // Justiça Estadual (J=8)
    if (j === '8') {
      return this.TR_TO_STATE_ALIAS[tr] || null;
    }

    // Tribunais Superiores (J=1, 2, 3, etc - Implementar conforme demanda)
    // Por enquanto foca nos principais
    
    return null;
  }

  public static async searchProcess(processNumber: string) {
    const cleanNumber = processNumber.replace(/\D/g, '');
    const alias = this.getTribunalAlias(cleanNumber);

    if (!alias) {
      throw new Error('Não foi possível identificar o tribunal pelo número do processo ou tribunal não suportado.');
    }

    const endpoint = `${this.BASE_URL}/api_publica_${alias}/_search`;
    
    console.log(`🔍 Consultando Datajud: ${alias} - ${cleanNumber}`);

    const payload = {
      query: {
        match: {
          numeroProcesso: cleanNumber
        }
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': this.API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro API Datajud (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return {
        alias,
        tribunal: alias.toUpperCase(),
        total: data.hits?.total?.value || 0,
        processes: data.hits?.hits?.map((hit: any) => hit._source) || []
      };

    } catch (error) {
      console.error('❌ Erro na consulta Datajud:', error);
      throw error;
    }
  }
}
