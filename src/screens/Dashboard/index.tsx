import React, { useCallback, useEffect, useState } from "react";

import {
  Container,
  Header,
  UserInfo,
  Photo,
  User,
  UserGreetings,
  UserName,
  UserWrapper,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionsList,
  LogoutButton,
} from "./styles";

import { HighlightCard } from "../../components/HighlightCard";
import {
  TransactionCard,
  TransactionCardProps,
} from "../../components/TransactionCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Loading } from "../../components/Loading";
import { useAuth } from "../../hooks/useAuth";

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightData {
  entries: {
    amount: string;
    lastTransaction: string;
  };
  expensives: {
    amount: string;
    lastTransaction: string;
  };
  total: string;
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>(
    {} as HighlightData
  );
  const { signOut, user } = useAuth();

  function getLastTransactionDate(
    transactions: DataListProps[],
    type: "up" | "down"
  ) {
    // filtra somente as transacoes positivas, depois pega só o timestamp das datas dessas transacoes
    // e pega o maior valor utilizando o Math, já transformando pra um Date. Depois formata.
    const lastTransaction = Math.max.apply(
      Math,
      transactions
        .filter((transaction) => transaction.type === type)
        .map((transaction) => new Date(transaction.date).getTime())
    );
    const lastTransactionFormatted = new Date(lastTransaction).toLocaleString(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
      }
    );

    return lastTransactionFormatted;
  }

  async function loadTransactions() {
    const dataKey = `@gofinances:transactions_user:${user.id}`;
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];
    let entriesTotal = 0;
    let expensivesTotal = 0;

    console.log(transactions);

    const transactionsFormatted: DataListProps[] = transactions.map(
      (transaction: DataListProps) => {
        //calculando o total de entrada e saida
        if (transaction.type === "up") {
          entriesTotal = entriesTotal + Number(transaction.amount);
        } else {
          expensivesTotal = expensivesTotal + Number(transaction.amount);
        }
        //formatando a moeda
        const amount = Number(transaction.amount).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });

        //formatando a data
        const date = Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date(transaction.date));

        return {
          id: transaction.id,
          name: transaction.name,
          amount: amount,
          type: transaction.type,
          category: transaction.category,
          date: date,
        };
      }
    );

    setTransactions(transactionsFormatted);

    const lastEntryTransaction = getLastTransactionDate(transactions, "up");
    const lastExpensiveTransaction = getLastTransactionDate(
      transactions,
      "down"
    );

    const total = entriesTotal - expensivesTotal;

    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        lastTransaction: lastEntryTransaction,
      },
      expensives: {
        amount: expensivesTotal.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        lastTransaction: lastExpensiveTransaction,
      },
      total: total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    });
    setIsLoading(false);
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  //funcao para renderizar novamente ao clicar na aba atualizando os dados
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  return (
    <Container>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo
                  source={{
                    uri: user.photo,
                  }}
                />
                <User>
                  <UserGreetings>Olá, </UserGreetings>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>
              <LogoutButton onPress={signOut}>
                <Icon name="power" />
              </LogoutButton>
            </UserWrapper>
          </Header>

          <HighlightCards>
            <HighlightCard
              type="up"
              title="Entradas"
              amount={highlightData.entries.amount}
              lastTransaction={`Última entrada dia ${highlightData.entries.lastTransaction}`}
            />
            <HighlightCard
              type="down"
              title="Saídas"
              amount={highlightData.expensives.amount}
              lastTransaction={`Última saída dia ${highlightData.expensives.lastTransaction}`}
            />
            <HighlightCard
              type="total"
              title="Total"
              amount={highlightData.total}
              lastTransaction={`01 à ${highlightData.expensives.lastTransaction}`}
            />
          </HighlightCards>

          <Transactions>
            <Title>Listagem</Title>

            <TransactionsList
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TransactionCard data={item} />}
            />
          </Transactions>
        </>
      )}
    </Container>
  );
}
