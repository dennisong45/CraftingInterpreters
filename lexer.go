package main

import (
	"fmt"
	"strings"
	"unicode"
)

type TokenType int

const (
	// Literal Types
	Number     TokenType = iota // Iota is Enum = 0
	Identifier                  // 1
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
	UnidentifiedFlyingObject = 12
)

var keywords = map[string]TokenType{
	"let":        Let,
	"func":       Func,
	"for":        For,
	"range":      Range,
	"cappuchino": Cappuchino,
}

type Token struct {
	Value string
	Type  TokenType
}

func newToken(value string, tokenType TokenType) Token {
	return Token{Value: value, Type: tokenType}
}

func deprecatedTokenized(sourceCode string) []Token {
	var tokens []Token
	var currentToken strings.Builder
	for i := 0; i < len(sourceCode); i++ {
		char := rune(sourceCode[i])
		if unicode.IsLetter(char) {
			currentToken.WriteRune(char)
		}
		//char := rune(sourceCode[i]) // https://exercism.org/tracks/go/concepts/runes <-- utf32
		//if unicode.IsSpace(char) {
		//    continue
		//}else if unicode.IsLetter(char){ // A letter, "LET"
		//	currentToken.WriteRune(char) // "L" for example
		//	for (i+1 < len(sourceCode) && unicode.IsLetter(rune(sourceCode[i+1]))) {
		//        i++
		//        currentToken.WriteRune(rune(sourceCode[i])) // "E"
		//    }
		//	tokenValue := currentToken.String() // LET
		//	tokenType, isKeyword := keywords[strings.ToLower(tokenValue)] // Is it my reserved
		//	if !isKeyword {
		//		tokenType = Identifier
		//	}
		//	tokens = append(tokens, newToken(currentToken.String(), tokenType))
		//	currentToken.Reset()
		//}else{
		//	switch char {
		//	case '-', '+', '/', '*':
		//		tokens = append(tokens, newToken(string(char), BinaryOperator))
		//	case '=':
		//		tokens = append(tokens, newToken(string(char), Equals))
		//	case '(':
		//		tokens = append(tokens, newToken(string(char), OpenParent))
		//	case ')':
		//		tokens = append(tokens, newToken(string(char), CloseParent))
		//	default:
		//		fmt.Printf("Unexpected character: %c\n", char)
		//	}
		//}
	}
	return tokens
}

func getToken(sourceCode string) []Token {
	var currentToken = strings.Builder{}
	var tokens []Token

	for i := 0; i < len(sourceCode); i++ {
		thisChar := rune(sourceCode[i])
		if unicode.IsLetter(thisChar) { //LET for example
			currentToken.WriteRune(thisChar) // im writing L
			// If is this a letter,  i want to check reserved
			//like leetcode question, lets go next char before determine
			var tempOne = i
			for tempOne+1 < len(sourceCode) && unicode.IsLetter(rune(sourceCode[tempOne+1])) {
				tempOne++
				currentToken.WriteRune(rune(sourceCode[tempOne])) // im writing E
			}
			tokenValue := currentToken.String()
			tokenType, isKeyword := keywords[strings.ToLower(tokenValue)] // Is it my reserved
			if !isKeyword {
				tokenType = Identifier
			}
			currentToken.Reset()
			i = tempOne
			tokens = append(tokens, Token{Value: tokenValue, Type: tokenType})
		} else if unicode.IsDigit(thisChar) {
			tokens = append(tokens, newToken(string(thisChar), Number))
		} else {
			tokens = append(tokens, newToken(string(thisChar), UnidentifiedFlyingObject))
		}
	}

	return tokens
}

func checkChar(thisChar rune, sourceCode string) {

}

func main() {
	sourceCode := "Cappuchino+-xyz" // TODO: xyz still consider
	tokens := getToken(sourceCode)

	for _, token := range tokens {
		fmt.Printf("Token Value: %s, Token Type: %d\n", token.Value, token.Type)
	}
	//tokens := tokenize(sourceCode)
	//for _, token := range tokens {
	//	fmt.Printf("Token Value: %s, Token Type: %d\n", token.Value, token.Type)
	//}
}
