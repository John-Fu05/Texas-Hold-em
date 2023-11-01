class User {
    constructor(socketID){
        this.ID = socketID
    }

    setHand(firstCard, secondCard) {
        this.firstCard = firstCard;
        this.secondCard = secondCard;
    }

    getHand(){
        return [this.firstCard, this.secondCard]
    }

    getID(){
        return this.ID
    }

    setBalance(balance) {
      this.balance = balance
    }
}

module.exports = User