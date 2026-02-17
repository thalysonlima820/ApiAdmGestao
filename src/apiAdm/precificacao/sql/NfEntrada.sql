WITH CTE AS (
    SELECT
        E.CODFILIAL AS CODIGO_FILIAL,
        P.CODPROD AS COD_PRODUTO,
        P.DESCRICAO AS PRODUTO,
        D.DESCRICAO AS DEPARTAMENTO,
        P.CODAUXILIAR,
        NC.CODNCM,
        PDO.NUMPED,
        PDO.CODCOMPRADOR,
        B.MARGEM AS MARGEM_IDEAL,
        P.CLASSEVENDA,
        E.CUSTOULTENT AS CUSTO,
        ROUND(B.PVENDA, 2) AS VL_VENDA,
        ROW_NUMBER() OVER (
            PARTITION BY E.CODFILIAL,
            P.CODPROD
            ORDER BY
                PDO.DTFATUR DESC
        ) AS RN
    FROM
        PCEST E
        JOIN PCPRODUT P ON E.CODPROD = P.CODPROD
        JOIN PCFORNEC F ON P.CODFORNEC = F.CODFORNEC
        JOIN PCITEM I ON P.CODPROD = I.CODPROD
        JOIN PCPEDIDO PDO ON I.NUMPED = PDO.NUMPED
        AND PDO.CODFILIAL = E.CODFILIAL
        JOIN PCEMBALAGEM B ON P.CODPROD = B.CODPROD
        AND E.CODFILIAL = B.CODFILIAL
        JOIN PCDEPTO D ON P.CODEPTO = D.CODEPTO
        JOIN PCNCM NC ON P.CODNCMEX = NC.CODNCMEX
        JOIN PCMARCA MAR ON P.CODMARCA = MAR.CODMARCA
        JOIN PCSECAO CS ON P.CODSEC = CS.CODSEC
    WHERE
        PDO.DTFATUR > TO_DATE('01-JAN-2024', 'DD-MM-YYYY')
        AND B.EMBALAGEM IN ('UN', 'KG')
),
ULTIMA_ENTRADA AS (
    SELECT
        M.CODOPER,
        M.NUMNOTA,
        M.NUMPED,
        M.NUMTRANSENT,
        M.CODFORNEC,
        M.PERCREDICMS AS CREDITO_CUSTO_ICMS,
        M.PERPIS AS PIS,
        M.PERCOFINS AS COFINS,
        (M.PERCREDICMS + M.PERPIS + M.PERCOFINS) AS CREDITO_ENTRADA,
        M.VALORULTENT AS VALOR_ULTIMA_ENTRADA,
        M.CODFILIAL AS CODIGO_FILIAL,
        M.CODPROD AS COD_PRODUTO,
        M.DTMOV AS DATA_ULTIMA_ENTRADA,
        M.QT AS QT_TRANSFERIDA,
        ROW_NUMBER() OVER (
            PARTITION BY M.CODFILIAL,
            M.CODPROD
            ORDER BY
                M.DTMOV DESC
        ) AS RN
    FROM
        PCMOV M,
        PCPEDIDO P
    WHERE
        M.NUMPED = P.NUMPED
        AND M.DTMOV > TO_DATE('01-JAN-2023', 'DD-MM-YYYY')
        AND M.CODOPER IN ('E', 'EB')
        AND P.TIPOBONIFIC IN ('N', 'B')
),
PVT AS (
    SELECT
        P.CODPROD,
        M.CODFILIAL,
        ROUND(
            M.VALORULTENT + (M.VALORULTENT * NVL(SM.MARKUP, 40) / 100),
            2
        ) AS PRECOMINSUG,
        CONCAT(NVL(SM.MARKUP, 40), '%') AS MARKUP,
        ROW_NUMBER() OVER (
            PARTITION BY M.CODFILIAL,
            P.CODPROD
            ORDER BY
                M.DTMOV DESC
        ) AS RN
    FROM
        PCPRODUT P
        JOIN PCSECAO S ON P.CODSEC = S.CODSEC
        JOIN PCMOV M ON P.CODPROD = M.CODPROD
        LEFT JOIN SITEMARKUP SM ON P.CODSEC = SM.CODSEC
        AND P.CLASSEVENDA = SM.CURVA 
    WHERE
        M.CODOPER = 'E'
        AND M.DTMOV > TO_DATE('01-JAN-2023', 'DD-MM-YYYY')
),
IMPOSTO AS (
    SELECT
        CODPROD,
        CODFILIAL,
        PERCIMP,
        ROW_NUMBER() OVER (
            PARTITION BY CODFILIAL,
            CODPROD
            ORDER BY
                CODPROD ASC
        ) AS RN
    FROM
        (
            SELECT
                NVL(
                    (
                        CASE
                            WHEN PCEMBALAGEM.DTOFERTAINI <= TRUNC(SYSDATE)
                            AND PCEMBALAGEM.DTOFERTAFIM >= TRUNC(SYSDATE) THEN PCEMBALAGEM.POFERTA
                            ELSE PCEMBALAGEM.PVENDA
                        END
                    ),
                    0
                ) PVENDA,
                NVL(
                    (
                        CASE
                            WHEN PCCONSUM.SUGVENDA = 1 THEN PCEST.CUSTOREAL
                            WHEN PCCONSUM.SUGVENDA = 2 THEN PCEST.CUSTOFIN
                            ELSE PCEST.CUSTOULTENT
                        END
                    ),
                    0
                ) PCUSTO,
                PCEMBALAGEM.MARGEM,
                PCTRIBUT.CODICMTAB,
                PCTRIBUT.PERDESCCUSTO,
                PCEMBALAGEM.CODAUXILIAR,
                PCPRODUT.DESCRICAO,
                PCEMBALAGEM.EMBALAGEM,
                PCEMBALAGEM.UNIDADE,
                PCPRODUT.PRECOFIXO,
                PCPRODUT.PCOMREP1,
                PCPRODUT.PESOBRUTO,
                PCEST.CUSTOFIN,
                PCEST.CUSTOREAL,
                PCEST.CODFILIAL,
                PCEST.CODPROD,
                PCEST.DTULTENT,
                PCEST.QTULTENT,
                PCEST.CUSTOULTENT,
                (
                    NVL(PCEST.QTESTGER, 0) - NVL(PCEST.QTBLOQUEADA, 0) - NVL(PCEST.QTRESERV, 0)
                ) QTESTDISP,
                PCREGIAO.VLFRETEKG,
                (
                    NVL(PCCONSUM.TXVENDA, 0) + NVL(PCPRODUT.PCOMREP1, 0) + NVL(PCTRIBUT.CODICMTAB, 0)
                ) / 100 PERCIMP,
                NVL(PCTRIBUT.PERDESCCUSTO, 0) / 100 PERDESCUSTO
            FROM
                PCTABTRIB,
                PCPRODUT,
                PCEMBALAGEM,
                PCEST,
                PCTRIBUT,
                PCCONSUM,
                PCREGIAO
            WHERE
                PCTABTRIB.CODPROD = PCPRODUT.CODPROD
                AND PCPRODUT.CODPROD = PCEST.CODPROD
                AND PCPRODUT.CODPROD = PCEMBALAGEM.CODPROD
                AND PCTABTRIB.CODST = PCTRIBUT.CODST
                AND PCREGIAO.NUMREGIAO = 1.000000
                AND PCTABTRIB.UFDESTINO = 'PA'
                AND PCTABTRIB.CODFILIALNF = PCEMBALAGEM.CODFILIAL
                AND PCEMBALAGEM.CODFILIAL = PCEST.CODFILIAL
        )
)
SELECT
    A.CODIGO_FILIAL,
    C.NUMNOTA,
    A.DEPARTAMENTO,
    F.FORNECEDOR,
    A.NUMPED,
    A.CODCOMPRADOR,
    COM.NOME,
    A.COD_PRODUTO,
    A.PRODUTO,
    A.CODAUXILIAR,
    A.CLASSEVENDA,
    TO_CHAR(C.DATA_ULTIMA_ENTRADA, 'DD/MM/YYYY') as DATA_ULTIMA_ENTRADA,
    A.CODNCM,
    A.MARGEM_IDEAL,
    ROUND(C.VALOR_ULTIMA_ENTRADA, 2) VALOR_ULTIMA_ENTRADA,
    ROUND(A.CUSTO, 2) CUSTO,
    ROUND(
        (
            (
                (A.VL_VENDA - C.VALOR_ULTIMA_ENTRADA) / NULLIF(A.VL_VENDA, 0)
            ) * 100
        ),
        2
    ) AS MARGEM_ATUAL,
    CASE
        WHEN A.VL_VENDA <> 0 THEN ROUND(
            (
                (
                    A.VL_VENDA - ((I.PERCIMP * A.VL_VENDA) + A.CUSTO)
                ) / A.VL_VENDA
            ) * 100,
            2
        )
        ELSE NULL
    END AS MARGEM_ATUAL_WTH,
    A.VL_VENDA,
    B.PRECOMINSUG,
    B.MARKUP,
    I.PERCIMP AS IMPOSTO,
    ROUND(
        (
            (
                B.PRECOMINSUG -((I.PERCIMP * B.PRECOMINSUG) + A.CUSTO)
            ) / B.PRECOMINSUG
        ) * 100,
        2
    ) AS MARGEM_FUTURA_WTH
FROM
    CTE A,
    PVT B,
    ULTIMA_ENTRADA C,
    PCEMPR COM,
    PCFORNEC F,
    IMPOSTO I
WHERE
    A.COD_PRODUTO = B.CODPROD
    AND A.CODIGO_FILIAL = B.CODFILIAL
    AND A.COD_PRODUTO = I.CODPROD
    AND A.CODIGO_FILIAL = I.CODFILIAL
    AND A.CODCOMPRADOR = COM.MATRICULA
    AND A.COD_PRODUTO = C.COD_PRODUTO
    AND C.CODFORNEC = F.CODFORNEC
    AND A.CODIGO_FILIAL = C.CODIGO_FILIAL
    AND A.RN = 1
    AND B.RN = 1
    AND C.RN = 1
    AND I.RN = 1
    AND B.PRECOMINSUG > A.VL_VENDA
    AND (A.VL_VENDA * 1.01) <= B.PRECOMINSUG
    AND C.DATA_ULTIMA_ENTRADA >= TO_DATE(
        :data_entrada,
        'DD-MON-YYYY',
        'NLS_DATE_LANGUAGE=ENGLISH'
    )
ORDER BY
    A.DEPARTAMENTO,
    A.COD_PRODUTO