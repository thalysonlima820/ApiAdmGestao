WITH MOVIMENTOS AS (
    SELECT
        M.CODFILIAL,
        TRUNC(M.DTMOV) AS DATA_MOV,
        M.NUMNOTA,
        M.CODEPTO,
        D.DESCRICAO AS DEPARTAMENTO,
        SUM(M.QT * M.PUNIT) AS VENDA,
        SUM(M.QT * M.CUSTOFIN) AS CUSTO
    FROM PCMOV M
    JOIN PCDEPTO D
        ON D.CODEPTO = M.CODEPTO
       WHERE M.DTMOV BETWEEN TO_DATE(
	            :datainicio,
	            'DD-MON-YYYY',
	            'NLS_DATE_LANGUAGE=ENGLISH'
	        )
	        AND TO_DATE(
	            :datafim,
	            'DD-MON-YYYY',
	            'NLS_DATE_LANGUAGE=ENGLISH'
	        )
      AND M.CODOPER = 'S'
    GROUP BY
        M.CODFILIAL,
        TRUNC(M.DTMOV),
        M.NUMNOTA,
        M.CODEPTO,
        D.DESCRICAO
),
NOTAS AS (
    SELECT
        P.CODFILIAL,
        TRUNC(P.DTSAIDA) AS DATA_SAIDA,
        P.NUMNOTA
    FROM PCNFSAID P
        WHERE P.DTSAIDA BETWEEN TO_DATE(
	            :datainicio,
	            'DD-MON-YYYY',
	            'NLS_DATE_LANGUAGE=ENGLISH'
	        )
	        AND TO_DATE(
	            :datafim,
	            'DD-MON-YYYY',
	            'NLS_DATE_LANGUAGE=ENGLISH'
	        )
      AND P.DTCANCEL IS NULL
      AND P.CONDVENDA IN (1, 5)
    GROUP BY
        P.CODFILIAL,
        TRUNC(P.DTSAIDA),
        P.NUMNOTA
),
BASE AS (
    SELECT
        M.CODFILIAL,
        M.DATA_MOV,
        M.NUMNOTA,
        M.CODEPTO,
        M.DEPARTAMENTO,
        M.VENDA,
        M.CUSTO
    FROM MOVIMENTOS M
    JOIN NOTAS N
        ON N.CODFILIAL = M.CODFILIAL
       AND N.NUMNOTA = M.NUMNOTA
),
NOTA_DEPTO_PRINCIPAL AS (
    SELECT
        B.CODFILIAL,
        B.NUMNOTA,
        B.CODEPTO,
        B.DEPARTAMENTO,
        ROW_NUMBER() OVER (
            PARTITION BY B.CODFILIAL, B.NUMNOTA
            ORDER BY B.VENDA DESC, B.CODEPTO
        ) AS RN
    FROM BASE B
),
NUMVENDAS_DEPTO AS (
    SELECT
        NDP.CODFILIAL,
        NDP.DEPARTAMENTO,
        COUNT(*) AS NUMVENDAS
    FROM NOTA_DEPTO_PRINCIPAL NDP
    WHERE NDP.RN = 1
    GROUP BY
        NDP.CODFILIAL,
        NDP.DEPARTAMENTO
),
VENDA AS (
    SELECT
        B.CODFILIAL,
        B.DEPARTAMENTO,
        ROUND(SUM(B.CUSTO), 2) AS CUSTO,
        ROUND(SUM(B.VENDA), 2) AS VENDA,
        NVL(MAX(NV.NUMVENDAS), 0) AS NUMVENDAS,
        ROUND(SUM(B.VENDA) - SUM(B.CUSTO), 2) AS LUCRO,
        ROUND(
            SUM(B.VENDA) / NULLIF(NVL(MAX(NV.NUMVENDAS), 0), 0),
            2
        ) AS TICKET_MEDIO,
        CASE
            WHEN SUM(B.VENDA) = 0 THEN 0
            ELSE ROUND(
                ((SUM(B.VENDA) - SUM(B.CUSTO)) * 100) / SUM(B.VENDA),
                2
            )
        END AS MARGEM
    FROM BASE B
    LEFT JOIN NUMVENDAS_DEPTO NV
        ON NV.CODFILIAL = B.CODFILIAL
       AND NV.DEPARTAMENTO = B.DEPARTAMENTO
    GROUP BY
        B.CODFILIAL,
        B.DEPARTAMENTO
),
META AS (
    SELECT
        PCMETASUP.CODFILIAL,
        SUM(PCMETASUP.VLVENDAPREV) AS META
    FROM PCMETASUP
    WHERE PCMETASUP.DATA BETWEEN TO_DATE(
	            :datainicio,
	            'DD-MON-YYYY',
	            'NLS_DATE_LANGUAGE=ENGLISH'
	        )
	        AND TO_DATE(
	            :datafim,
	            'DD-MON-YYYY',
	            'NLS_DATE_LANGUAGE=ENGLISH'
	        )
    GROUP BY
        PCMETASUP.CODFILIAL
)
SELECT
    V.*,
    M.META,
    NVL(
        ROUND((V.VENDA / NULLIF(M.META, 0)) * 100, 2),
        0
    ) AS PERCENTUAL_CARREGADO
FROM VENDA V
LEFT JOIN META M
    ON V.CODFILIAL = M.CODFILIAL
ORDER BY
    V.CODFILIAL,
    V.DEPARTAMENTO