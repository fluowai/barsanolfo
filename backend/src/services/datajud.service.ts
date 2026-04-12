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

  private static TRT_TO_ALIAS: Record<string, string> = {
    '1': 'trt1', '2': 'trt2', '3': 'trt3', '4': 'trt4', '5': 'trt5',
    '6': 'trt6', '7': 'trt7', '8': 'trt8', '9': 'trt9', '10': 'trt10',
    '11': 'trt11', '12': 'trt12', '13': 'trt13', '14': 'trt14', '15': 'trt15',
    '16': 'trt16', '17': 'trt17', '18': 'trt18', '19': 'trt19', '20': 'trt20',
    '21': 'trt21', '22': 'trt22', '23': 'trt23', '24': 'trt24'
  };

  private static getTribunalAlias(cnjRaw: string): string | null {
    const cnj = cnjRaw.replace(/\D/g, '');
    
    if (cnj.length < 20) return null;

    const j = cnj.substring(13, 14);
    const tr = cnj.substring(14, 16);

    if (j === '4') return `trf${parseInt(tr)}`;
    if (j === '5') return this.TRT_TO_ALIAS[tr] || null;
    if (j === '8') return this.TR_TO_STATE_ALIAS[tr] || null;
    if (j === '1') return 'stf';
    if (j === '2') return 'stj';
    if (j === '3') return 'tst';

    return null;
  }

  public static async searchProcess(processNumber: string) {
    const cleanNumber = processNumber.replace(/\D/g, '');
    const alias = this.getTribunalAlias(cleanNumber);

    if (!alias) {
      throw new Error('Não foi possível identificar o tribunal pelo número do processo.');
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

      const data: any = await response.json();
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

  public static async getMovements(processNumber: string) {
    const result = await this.searchProcess(processNumber);
    
    if (result.processes && result.processes.length > 0) {
      const processo = result.processes[0];
      return processo.movimentacoes || [];
    }
    
    return [];
  }

  public static async searchJurisprudence(
    query: string, 
    court?: string, 
    theme?: string, 
    page: number = 0, 
    size: number = 10
  ) {
    const aliases = court ? [court] : ['tjgo', 'tst', 'stj', 'stf'];
    const allResults: any[] = [];
    let totalHits = 0;

    for (const alias of aliases) {
      const endpoint = `${this.BASE_URL}/api_publica_${alias}/_search`;
      
      const mustClauses: any[] = [];
      mustClauses.push({
        match: {
          conteudo: query
        }
      });

      if (theme) {
        mustClauses.push({
          match: {
            tema: theme
          }
        });
      }

      const payload = {
        query: {
          bool: {
            must: mustClauses
          }
        },
        from: page * size,
        size: size,
        sort: [
          { dataPublicacao: { order: 'desc' } }
        ]
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

        if (response.ok) {
          const data: any = await response.json();
          const hits = data.hits?.hits?.map((hit: any) => ({
            ...hit._source,
            tribunal: alias.toUpperCase(),
            score: hit._score
          })) || [];
          
          allResults.push(...hits);
          totalHits += data.hits?.total?.value || 0;
        }
      } catch (error) {
        console.error(`Erro na busca ${alias}:`, error);
      }
    }

    return {
      results: allResults.slice(0, size),
      total: totalHits,
      page,
      size,
      query
    };
  }

  public static async getAvailableCourts() {
    return [
      { id: 'tjgo', name: 'TJGO - Tribunal de Justiça de Goiás' },
      { id: 'trt18', name: 'TRT 18 - Goiás' },
      { id: 'tst', name: 'TST - Tribunal Superior do Trabalho' },
      { id: 'stj', name: 'STJ - Superior Tribunal de Justiça' },
      { id: 'stf', name: 'STF - Supremo Tribunal Federal' },
      { id: 'tjsp', name: 'TJSP - Tribunal de Justiça de São Paulo' },
      { id: 'tjrj', name: 'TJRJ - Tribunal de Justiça do Rio de Janeiro' },
      { id: 'tjmg', name: 'TJMG - Tribunal de Justiça de Minas Gerais' },
      { id: 'tjrs', name: 'TJRS - Tribunal de Justiça do Rio Grande do Sul' },
      { id: 'tjpe', name: 'TJPE - Tribunal de Justiça de Pernambuco' },
    ];
  }

  public static async getJudges(court: string) {
    const endpoint = `${this.BASE_URL}/api_publica_${court}/_search`;
    
    const payload = {
      size: 0,
      aggs: {
        magistrates: {
          terms: {
            field: 'magistrado',
            size: 100
          }
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
        throw new Error('Erro ao buscar magistrados');
      }

      const data: any = await response.json();
      return data.aggregations?.magistrates?.buckets?.map((bucket: any) => ({
        name: bucket.key,
        count: bucket.doc_count
      })) || [];

    } catch (error) {
      console.error('Erro ao buscar magistrados:', error);
      throw error;
    }
  }
}
