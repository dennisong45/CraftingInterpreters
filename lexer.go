package main

import (
	"fmt"
    "unicode"
	"strings"
)

type TokenType int

const (
	// Literal Types
	Number TokenType = iota // Iota is Enum = 0
	Identifier // 1
	// Reserve VIP Word
	Let
	Func
	For
	Auto
	Range
	Cappuchino
	// Grouping and Operators
	BinaryOperator
	Equals
	OpenParent
	CloseParent
)

var keywords = map[string]TokenType{
    "let":  Let,
    "func": Func,
	"for": For,
	"range": Range,
	"cappuchino": Cappuchino,
}

type Token struct {
	Value string
	Type  TokenType
}

func newToken(value string, tokenType TokenType) Token {
	return Token{Value: value, Type: tokenType}
}

func tokenize(sourceCode string) []Token {
	var tokens []Token
	var currentToken strings.Builder
	for i := 0; i < len(sourceCode); i++ {
		char := rune(sourceCode[i]) // https://exercism.org/tracks/go/concepts/runes <-- utf32
        if unicode.IsSpace(char) {
            continue
        }else if unicode.IsLetter(char){ // A letter, "LET"
			currentToken.WriteRune(char) // "L" for example
			for (i+1 < len(sourceCode) && unicode.IsLetter(rune(sourceCode[i+1]))) {
                i++ 
                currentToken.WriteRune(rune(sourceCode[i])) // "E"
            }
			tokenValue := currentToken.String() // LET
			tokenType, isKeyword := keywords[strings.ToLower(tokenValue)] // Is it my reserved
			if !isKeyword {
				tokenType = Identifier
			}
			tokens = append(tokens, newToken(currentToken.String(), tokenType))
			currentToken.Reset()
		}else{
			switch char {
			case '-', '+', '/', '*':
				tokens = append(tokens, newToken(string(char), BinaryOperator))
			case '=':
				tokens = append(tokens, newToken(string(char), Equals))
			case '(':
				tokens = append(tokens, newToken(string(char), OpenParent))
			case ')':
				tokens = append(tokens, newToken(string(char), CloseParent))
			default:
				fmt.Printf("Unexpected character: %c\n", char)
			}
		}
	}
	return tokens
}
func main() {
    sourceCode := "Cappuchino+-xyz" // TODO: xyz still consider
    tokens := tokenize(sourceCode)
    for _, token := range tokens {
        fmt.Printf("Token Value: %s, Token Type: %d\n", token.Value, token.Type)
    }
}

